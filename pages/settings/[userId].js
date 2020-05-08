import { useEffect, useReducer } from 'react'

import API from '../../lib/api/api-endpoints'
import Avatar from '../../components/user/avatar/avatar'
import Button from '../../components/generic/button/button'
import DynamicField from '../../components/generic/dynamic-field/dynamic-field-edit'
import Layout from '../../components/layout/normal/layout'
import config from '../../lib/config'
import fetch from '../../lib/fetcher'
import { usePermission } from '../../lib/hooks'
import { useRouter } from 'next/router'
import useSWR from 'swr'

const reducer = (state, action) => {
  
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      const { picture, displayName, ...profile } = action.payload.profile
      const { username, email } = action.payload

      return {
        ...state,
        seeded: true,
        username: {
          value: username
        },
        email: {
          value: email
        },

        displayName: {
          value: displayName
        },
        
        picture: {
          value: picture
        },

        profile: {
          value: profile
        }

      }

    case 'UPDATE_FIELD': 
      return {
        ...state,
        [action.field]: {
            ...state[action.field],
            value: action.payload,
          }
        }
      
      
    case 'UPDATE_PROFILE_FIELD': 
      return {
        ...state,
        profile: {
          ...state.profile,
          value: {
            ...state.profile.value || {},
            [action.field]: action.payload,
          }
        },
      }
    
    case 'SET_VALIDATION_ERROR': 
      return {
        ...state,
        [action.field]: {
          ...state[action.field],
          error: action.payload
        }
      }

    case 'SAVE_FIELD':
      return {
        ...state, 
        [action.field]: {
          ...state[action.field],
          loading: true,
          error: false,
          success: false
        }
      }
    case 'SAVE_FIELD_SUCCESS':
        return {
          ...state, 
          [action.field]: {
            ...state[action.field],
            loading: false,
            error: false,
            success: true
          }
        }
    case 'SAVE_FIELD_ERROR':
        return {
          ...state, 
          [action.field]: {
            ...state[action.field],
            loading: false,
            error: action.payload || true,
            success: false
          }
        }
    
   
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}


const UserSettings = () => {
  
  const [state, dispatch] = useReducer(reducer, {
    username: {},
    email: {},
    profile: {
      value: {}
    },
    displayName: {},
    password: {},
    deleteAccount: {}
  })

  // Check if the logged in user can access to this resource
  const router = useRouter()
  const { userId } = router.query

  const permissions = usePermission(
    userId ? ['user.update', 'user.admin'] : null,
    '/',
    (u) => u && u.id === userId,
    userId
  )
  
  const userResponse = useSWR( userId ? `/api/users/` + userId : null, fetch)
  const finished = Boolean(userResponse.data) || Boolean(userResponse.error)
  const user = userResponse.data

  useEffect(() => {
    if (user && !state.seeded) {
      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: user,
      })
    }
  }, [user])

  
  // Loading
  if (!finished || !permissions.finished) {
    return (
      <Layout title="Profile">
        <h1>Profile</h1>
        <div>Loading...</div>
      </Layout>
    )
  }

  if (!userResponse.data) {
    // Redirect to 404 if the user is not found
    router.push('/404')
  }



  // Generic field change
  const handleFieldProfileChange = (name) => (value) => {
    dispatch({
      type: 'UPDATE_PROFILE_FIELD',
      field: name,
      payload: value
    })
  }

  const handleFieldChange = (name) => (value) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: name,
      payload: value
    })
  }

  // On submit method for using in each case
  const onSubmit = (
    getDataCb,
    validateData,
    key,
    url,
    apiErrorMessage = 'Error updating data'
  ) => (ev) => {
    ev.preventDefault()
    const data = getDataCb(ev)

    if (!validateData(data)) {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        field: key,
        payload: 'Please complete the required fields'
      })

      return
    } else {
      dispatch({
        type: 'SET_VALIDATION_ERROR',
        field: key,
        payload: false
      })
    }

    dispatch({
      type: 'SAVE_FIELD',
      field: key
    })

    fetch(url, {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((result) => {
        dispatch({
          type: 'SAVE_FIELD_SUCCESS',
          field: key,
          payload: result
        })
    
      })
      .catch((err) => {
        dispatch({
          type: 'SAVE_FIELD_ERROR',
          field: key,
          payload: apiErrorMessage
        })
      })
  }

  const onSubmitDelete = () => {}

  /* On submit username */
  const onSubmitUsername = onSubmit(
    (ev) => {
      const username = ev.currentTarget.username.value
      return {
        username,
      }
    },
    (d) => {
      if (!d.username) {
        return false
      }

      if (d.username.length < 3) {
        return false
      }

      return true
    },
    'username',
    `${API.users}/${user.id}/username`,
    'Error updating your username'
  )

  /* On submit email */
  const onSubmitEmail = onSubmit(
    (ev) => {
      const email = ev.currentTarget.email.value
      return {
        email,
      }
    },
    (d) => {
      if (!d.email) {
        return false
      }

      if (d.email.length < 3) {
        return false
      }

      return true
    },
    'email',
    `${API.users}/${user.id}/email`,
    'Error updating your email'
  )

  const onSubmitDisplayName = onSubmit(
    (ev) => {
      const displayName = ev.currentTarget.displayName.value
      return {
        displayName,
      }
    },
    (d) => {
      if (!d.displayName) {
        return false
      }

      if (d.displayName.length < 3) {
        return false
      }

      return true
    },
    'displayName',
    `${API.users}/${user.id}/profile`,
    'Error updating your name'
  )

  const onSubmitPassword = onSubmit(
    (ev) => {
      const password = ev.currentTarget.password.value
      const newpassword = ev.currentTarget.newpassword.value
      const rnewpassword = ev.currentTarget.rnewpassword.value
      return {
        password,
        newpassword,
        rnewpassword,
      }
    },
    (d) => {
      if (d.newpassword !== d.newpassword) {
        return false
      }

      if (d.newpassword.length < 8) {
        return false
      }

      if (!d.password) {
        return false
      }

      return true
    },
    'password',
    `${API.users}/${user.id}/password`,
    'Error updating your password'
  )

  const onSubmitProfile = onSubmit(
    () => state.profile.value,
    (d) => {
      let valid = true
      config.user.profile.fields.forEach((f) => {
        if (f.required && !d[f.name]) {
          valid = false
        }

        if (f.min && d[f.name].length < f.min) {
          valid = false
        }

        if (f.max && d[f.name].length > f.max) {
          valid = false
        }
      })
      return valid
    },
    'profile',
    `${API.users}/${user.id}/profile`,
    'Error updating profile data'
  )

  return (
    permissions.available && (
      <Layout title="User Settings">
        <div className="user-settings-page">
          <div className="settings">
            <div className="configuration-block">
              <h2>Avatar</h2>
              <div className="block-settings">
                <p>Click on the avatar image to change it</p>
                <div className="field">
                  <Avatar src={user ? user.profile.picture : null} />
                </div>
              </div>
            </div>

            <div className="configuration-block">
              <h2>Username</h2>
              <form onSubmit={onSubmitUsername}>
                <div className="block-settings">
                  <p>
                    The username is unique and it's used for mentions or to
                    access your profile. Please use 48 characters at maximum.
                  </p>
                  <div className="field">
                    <input
                      type="text"
                      placeholder="Your username"
                      name="username"
                      onChange={(ev) => handleFieldChange('username')(ev.target.value)}
                      value={state.username.value}
                    />
                  </div>
                </div>
                <div className="actions">
                  <div className="info">
                    {state.username.error && (
                      <div className="error-message">{state.username.error}</div>
                    )}
                    {state.username.loading && (
                      <div className="loading-message">Loading...</div>
                    )}
                    {state.username.success && (
                      <div className="success-message">
                        Username updated correctly
                      </div>
                    )}
                  </div>

                  <Button loading={state.username.loading}>Change username</Button>
                </div>
              </form>
            </div>

            <div className="configuration-block">
              <h2>Your Name</h2>
              <form onSubmit={onSubmitDisplayName}>
                <div className="block-settings">
                  <p>
                    Please enter your full name, or a display name you are
                    comfortable with. Please use 32 characters at maximum.
                  </p>
                  <div className="field">
                    <input
                      type="text"
                      name="displayName"
                      placeholder="Your username"
                      onChange={(ev) => handleFieldChange('displayName')(ev.target.value)}
                      value={state.displayName.value}
                    />
                  </div>
                </div>
                <div className="actions">
                  <div className="info">
                    {state.displayName.error && (
                      <div className="error-message">{state.displayName.error}</div>
                    )}
                    {state.displayName.loading && (
                      <div className="loading-message">Loading...</div>
                    )}
                    {state.displayName.success && (
                      <div className="success-message">
                        Name updated correctly
                      </div>
                    )}
                  </div>
                  <Button loading={state.displayName.loading}>
                    Change Your Name
                  </Button>
                </div>
              </form>
            </div>

            <div className="configuration-block">
              <h2>Profile Information</h2>
              <form onSubmit={onSubmitProfile}>
                <div className="block-settings">
                  {config.user.profile.fields.map((field) => (
                    <DynamicField
                      key={field.name}
                      field={field}
                      value={state.profile.value[field.name]}
                      onChange={handleFieldProfileChange(field.name)}
                    />
                  ))}
                </div>
                <div className="actions">
                  <div className="info">
                    {state.profile.error && (
                      <div className="error-message">{state.profile.error}</div>
                    )}
                    {state.profile.loading && (
                      <div className="loading-message">Loading...</div>
                    )}
                    {state.profile.success && (
                      <div className="success-message">
                        profile updated correctly
                      </div>
                    )}
                  </div>

                  <Button loading={state.profile.loading}>Edit information</Button>
                </div>
              </form>
            </div>

            <div className="configuration-block">
              <h2>Email address</h2>
              <form onSubmit={onSubmitEmail}>
                <div className="block-settings">
                  <p>A new email will require e-mail validation</p>
                  <div className="field">
                    <input
                      type="text"
                      placeholder="Email"
                      name="email"
                      required
                      onChange={(ev) => handleFieldChange('email')(ev.target.value)}
                      value={state.email.value}
                    />
                  </div>
                </div>
                <div className="actions">
                  <div className="info">
                    {state.email.error && (
                      <div className="error-message">{state.email.error}</div>
                    )}
                    {state.email.loading && (
                      <div className="loading-message">Loading...</div>
                    )}
                    {state.email.success && (
                      <div className="success-message">
                        Email updated correctly. Please check your email inbox
                        to verify your new address.
                      </div>
                    )}
                  </div>
                  <Button loading={state.email.loading}>Change email</Button>
                </div>
              </form>
            </div>

            <div className="configuration-block">
              <h2>Change Password</h2>
              <form onSubmit={onSubmitPassword}>
                <div className="block-settings">
                  <div className="field">
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Current Password"
                    />
                  </div>
                  <div className="field">
                    <input
                      type="password"
                      name="newpassword"
                      required
                      placeholder="New Password"
                    />
                  </div>
                  <div className="field">
                    <input
                      type="password"
                      name="rnewpassword"
                      required
                      placeholder="Repeat new Password"
                    />
                  </div>
                </div>

                <div className="actions">
                  <div className="info">
                    {state.password.error && (
                      <div className="error-message">{state.password.error}</div>
                    )}
                    {state.password.loading && (
                      <div className="loading-message">Loading...</div>
                    )}
                    {state.password.success && (
                      <div className="success-message">
                        password updated correctly
                      </div>
                    )}
                  </div>
                  <Button loading={state.password.loading}>Update</Button>
                </div>
              </form>
            </div>

            <div className="configuration-block">
              <h2>Delete my account</h2>
              <form onSubmit={onSubmitDelete}>
                <div className="block-settings">
                  <p>
                    <strong>Warning</strong>, this action can not be undone
                  </p>
                  <div className="field">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div className="actions">
                  <div className="info">
                    {state.deleteAccount.error && (
                      <div className="error-message">{state.deleteAccount.error}</div>
                    )}
                    {state.deleteAccount.loading && (
                      <div className="loading-message">Loading...</div>
                    )}
                    {state.deleteAccount.success && (
                      <div className="success-message">
                        Your account was deleted. You will be redirected shortly
                      </div>
                    )}
                  </div>
                  <Button loading={state.deleteAccount.loading}>Delete</Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <style jsx>
          {`
            .user-settings-page {
              display: flex;
              flex-wrap: wrap;
            }

            .menu {
              width: 200px;
            }

            .configuration-block {
              border-radius: var(--empz-radius);
              overflow: hidden;

              margin-bottom: var(--empz-gap-double);
              background: var(--accents-2);
            }

            .configuration-block h2 {
              display: block;
              padding: var(--empz-gap);
              background: var(--empz-foreground);
              color: var(--empz-background);
              margin-bottom: var(--empz-gap);
            }

            .configuration-block .block-settings {
              padding: var(--empz-gap);
            }

            .configuration-block .block-settings p {
              margin-bottom: var(--empz-gap);
            }

            .configuration-block .actions {
              padding: var(--empz-gap);
              display: flex;
              justify-content: flex-end;
            }

            .configuration-block .info {
              padding: var(--empz-gap);
            }
          `}
        </style>
      </Layout>
    )
  )
}

export default UserSettings
