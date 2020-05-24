const Refactor = () => {
  return (
    <section className="refactor">
      {/*Header*/}
      <header className="edge-header">
        <div className="edge-container">
          {/*Logo*/}
          <h1 className="edge-logo">edge</h1>

          {/*User Actions*/}
          <div className="edge-user-actions">
            {/*Searchbox*/}
            <div className="edge-searchbox">
              <img src="/refactor/icon-search.svg" />
              <input type="text" placeholder="Search" />
            </div>
            {/*User Actions Buttons*/}
            <div className="edge-user-actions-buttons">
              <img src="/refactor/icon-configuration.svg" />
              <img src="/refactor/icon-messages.svg" />
            </div>
            {/*Avatar*/}
            <div className="edge-avatar has-status available">
              <img
                className="edge-avatar-image"
                src="https://storage.googleapis.com/edge-next/profilePicture/1590225157254-image_processing20200203-15714-1coq9nh.jpg"
              />
            </div>
            {/*Button*/}
            <button className="edge-button">Write a post</button>
          </div>
        </div>
      </header>

      {/*Edge Panels*/}
      <div className="edge-panels three-panels container">
        {/*Edge Panel User*/}
        <aside className="edge-panel-user">
          {/*Edge Avatar User*/}
          <div className="edge-avatar-user">
            {/*Avatar*/}
            <div className="edge-avatar medium has-status available">
              <img
                className="edge-avatar-image"
                src="https://storage.googleapis.com/edge-next/profilePicture/1590225157254-image_processing20200203-15714-1coq9nh.jpg"
              />
            </div>
            <div className="edge-avatar-user-info">
              <strong className="edge-user-name">Hayder Al-Deen</strong>
              <small className="edge-user-alias">@hayder</small>
            </div>
          </div>

          {/*Panel User Navigation*/}
          <nav className="edge-panel-user-navigation">
            <ul>
              <li>
                <a href="#">
                  <img src="/refactor/icon-groups.svg" />
                  My Groups
                </a>
              </li>
              <li>
                <a href="#">
                  <img src="/refactor/icon-rewards.svg" />
                  Rewards
                </a>
              </li>
              <li>
                <a href="#">
                  <img src="/refactor/icon-courses.svg" />
                  Courses
                </a>
              </li>
              <li>
                <a href="#">
                  <img src="/refactor/icon-analytics.svg" />
                  Analytics
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/*Edge Panel Content*/}
        <section className="edge-panel-content">
          {/*Edge Panel Content Inner*/}
          <div className="edge-panel-content-inner">
            {/*Edge Item Card*/}
            <article className="edge-item-card">
              {/*Edge Item Card Header*/}
              <header className="edge-item-card-header">
                {/*Edge Avatar User*/}
                <div className="edge-avatar-user">
                  {/*Avatar*/}
                  <div className="edge-avatar small has-status available">
                    <img
                      className="edge-avatar-image"
                      src="https://storage.googleapis.com/edge-next/profilePicture/1590225157254-image_processing20200203-15714-1coq9nh.jpg"
                    />
                  </div>
                  <div className="edge-avatar-user-info">
                    <strong className="edge-user-name">Hayder Al-Deen</strong>
                    <small className="edge-user-alias">@hayder</small>
                  </div>
                </div>

                {/*Edge Item Card Actions*/}
                <div className="edge-item-card-actions">
                  {/*Edge Button Has Icon*/}
                  <button className="edge-button has-icon check">
                    Following
                  </button>

                  {/*Edge Button Icon Counter*/}
                  <div className="edge-button-icon-counter">
                    <small className="edge-button-counter">21</small>
                    <button className="edge-button-icon">
                      <img src="/refactor/icon-heart.svg" />
                    </button>
                  </div>
                </div>
              </header>


              {/*Edge Item Card Footer*/}
              <footer className="edge-item-card-footer">
                <ul className="edge-item-card-stats">
                  <li className="edge-item-card-stats-item">
                    <b>954</b>
                    <span>comments</span>
                  </li>

                  <li className="edge-item-card-stats-item">
                    <b>3677</b>
                    <span>views</span>
                  </li>
                </ul>

                <div className="edge-button-share">
                  <span className="edge-button-share-title">Share this</span>
                  <ul className="edge-button-share-list">
                    <li className="edge-button-share-unit">F</li>
                    <li className="edge-button-share-unit">T</li>
                    <li className="edge-button-share-unit">W</li>
                  </ul>
                </div>
              </footer>
            </article>
          </div>
        </section>
        {/*Edge Panel Ads*/}
        <aside className="edge-panel-ads">asdf</aside>
      </div>
    </section>
  )
}
export default Refactor