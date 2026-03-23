import './version.scss';

const Version = () => {
  return (
   <div className='version-wrapper'>
    <div className="version-content col-md-6">
        <div className="tst-banner rounded-5 overflow-hidden position-relative">
            <h4>Stable Version 5.0.5</h4>
            <span className='fs-5' style={{color: "#fd5200"}}>Release 25_555</span>
            <div className="list-updates pt-1">
            <p className='fs-6 m-0'>3.0.0 Release project.</p>
            <p className='fs-6 m-0'>3.1.0 Global and personal record viewing is now available.</p>
            <p className='fs-6 m-0'>3.2.0 Added ability to change your avatar, as well as change your username.</p>
            <p className='fs-6 m-0'>3.3.0 Added Achievements.</p>
            <p className='fs-6 m-0'>3.4.0 Release Likes, Comments, Share on Lens.</p>
            <p className='fs-6 m-0'>3.5.0 User and Lens search implemented.</p>
            <p className='fs-6 m-0'>3.6.0 Ability to add friends, send personal messages.</p>
            <p className='fs-6 m-0'>3.7.0 Added notification for users.</p>
            <p className='fs-6 m-0'>3.8.0 Shop is now available for orders.</p>
            <p className='fs-6 m-0'>3.9.3 Premium is now available for orders.</p>
            <p className='fs-6 m-0'>4.0.1 Fix bugs & Design changes.</p>
            <p className='fs-6 m-0'>5.0.5 Weight Control Pro v 1.0</p>
        </div>
    </div>
</div>
   </div>
 );
};

export default Version;