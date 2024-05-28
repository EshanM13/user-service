const express = require('express');
const router = express.Router();
const {registerUser, loginUser, getProfile, updateProfile, updateRole, modifyProfileStatus, getUsers} = require('../controllers/userControllers');
const {authMiddleware, authorizeRoles} = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.use(authMiddleware);

router.route('/profile').get(getProfile);  // use put to update and patch to delete(disable)
router.get('/users', authorizeRoles('admin'), getUsers);  // only admin access- add middleware
router.patch('/update/role');
router.patch('/update/profile', updateProfile);
router.patch('/profile/update/status', modifyProfileStatus);
router.patch('/update/role', authorizeRoles('admin'), updateRole);

module.exports = router;