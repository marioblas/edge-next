import { deleteFile, uploadFile } from '../../../lib/api/storage'
import { findOneUser, generateSaltAndHash, updateOneUser, userPasswordsMatch } from '../../../lib/api/users/user'
import { onUserDeleted, onUserUpdated } from '../../../lib/api/hooks/user.hooks'

import { connect } from '../../../lib/api/db'
import formidable from 'formidable';
import { getSession } from '../../../lib/api/auth/iron'
import { hasPermissionsForUser } from '../../../lib/api/middlewares'
import methods from '../../../lib/api/api-helpers/methods'
import runMiddleware from '../../../lib/api/api-helpers/run-middleware'
import { v4 as uuidv4 } from 'uuid'

// disable the default body parser to be able to use file upload
export const config = {
  api: {
    bodyParser: false,
  }
}

const useFormidable = (cb) => (req, res) => {
  const form = formidable({ multiples: true });
 
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({error: err.message})
    }
    req.body = fields
    req.files = files
    cb(req, res)
  });

}


const userExist = (userId) => async (req, res, cb) => {
  let findUserId = userId

  if (userId === 'me') {
    const session = await getSession(req)

    if (!session) {
      cb(new Error('User not found'))
      return
    }

    findUserId = session.id
  }

  const user = await findOneUser({ id: findUserId })

  if (!user) {
    cb(new Error('User not found'))
  } else {
    req.user = user
    cb()
  }
}

const getUser = (req, res) => {
  // TODO: Hide private fields
  res.status(200).json(req.user)
}

const delUser = (req, res) => {
  // TODO: implement
  onUserDeleted(req.user)
  res.status(200).send({
    deleted: true,
  })
}

const updateUser = (slug) => (req, res) => {
  
  const updateData = slug[1]
  let promiseChange = null


  switch (updateData) {
    case 'profile':
      /* Update only profile data */
      promiseChange = updateOneUser(req.user.id, {
        profile: {
          ...req.user.profile,
          ...req.body,
        },
      })
      break
    case 'username':
      /* Update only username */
      promiseChange = findOneUser({ username: req.body.username }).then(
        (maybeUser) => {
          if (!maybeUser) {
            return updateOneUser(req.user.id, { username: req.body.username })
          } else {
            throw new Error('Username already exists')
          }
        }
      )
      break
    case 'email':
      /* Update only email */
      promiseChange = findOneUser({ email: req.body.email }).then(
        (maybeUser) => {
          if (!maybeUser) {
            return updateOneUser(req.user.id, {
              email: req.body.email,
              emailVerificationToken: uuidv4(),
            })
          } else {
            throw new Error('email already exists')
          }
        }
      )
      break

    case 'block':
      /* Update only blocked status */
      promiseChange = updateOneUser(req.user.id, {
        blocked: req.body.blocked,
      })
      break

    case 'password':
      /* Update only password */
      // Check that the current password req.req.body.password matches the old one
      const passwordsMatch = req.user.hash ? userPasswordsMatch(req.user, req.body.password) : true
      if (passwordsMatch ) {
        const { salt, hash } = generateSaltAndHash(req.body.newpassword) 
        promiseChange =  updateOneUser(req.user.id, {
          salt,
          hash
        })
      } else {
        promiseChange = Promise.reject('Incorrect password')
      }
      break
    
    case 'picture': 
      
      promiseChange = new Promise( async (resolve, reject) => {
        
          if (req.user.profile.picture) {
            try {
              await deleteFile(req.user.profile.picture)
            } catch (err) {
              console.log('Error deleting previous picture')
            }
          }

          let path = ''
          try {
            path = await uploadFile(req.files.profilePicture, 'profilePicture')
          } catch (err) {
            reject(new Error('Error uploading file'))
            return
          }
          
          updateOneUser(req.user.id, {
            profile: {
              ...req.user.profile,
              picture: path
            },
          })
          .then(resolve)
          .catch(reject)
      })

      break
    default:
      promiseChange = Promise.reject('Update ' + updateData + ' not allowed')
  }

  promiseChange
    .then((newUser) => {
      // Invoke the hook
      onUserUpdated(newUser, updateData)

      res.status(200).send({
        updated: true,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(400).send({
        error: err.message,
      })
    })
}

export default async (req, res) => {
  const {
    query: { slug },
  } = req

  const userId = slug[0]

  try {
    // Connect to database
    await connect()
  } catch (e) {
    // console.log(e)
    return res.status(500).json({
      message: e.message,
    })
  }

  try {
    await runMiddleware(req, res, hasPermissionsForUser(userId))
  } catch (e) {
    return res.status(401).json({
      message: e.message,
    })
  }

  try {
    await runMiddleware(req, res, userExist(userId))
  } catch (e) {
    // console.log(e)
    return res.status(404).json({
      message: e.message,
    })
  }

  methods(req, res, {
    get: getUser,
    del: delUser,
    put: useFormidable(updateUser(slug)),
  })
}
