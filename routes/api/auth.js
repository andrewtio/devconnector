const express = require('express');
const router = express.Router();
// use express router
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator/check');

// @route   GET api/auth
// @Desc    Test route
// @access  Public
// if private then you need auth token for connect

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // to leave the password in data
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    //try catch used because 
});
// whenever we need to use auth, just add it as 2nd parameter


// @route   POST api/auth
// @Desc    Authenticate user & get token
// @access  Public

router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required'
    ).exists()
    // this is all validation for data schema
],
    async (req, res) => {
        // console.log(req.body); // this is just to check request of body

        const errors = validationResult(req);
        if (!errors.isEmpty()) { // Jika error tidak kosong
            return res.status(400).json({
                errors: errors.array()
                // dengan fungsi ini jika validasi di atas ada yang gagal, maka akan memberikan respon error 400
                // error beserta pesan errornya, bisa ditest di postman
            });
        }

        // 11. User registration
        const { email, password } = req.body; // we pull these 3 variable from req.body

        try {
            // See if user exists, we don't want multiple email
            let user = await User.findOne({ email });

            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // make sure the password match
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // Return jsonwebtoken, so user can log in right away
            const payload = {
                user: {
                    id: user.id // with mongoose so we not use _id
                }
            }

            jwt.sign(
                payload, // pass payload
                config.get('jwtSecret'), // pass token
                { expiresIn: 3600 }, // token akan expire dalam berapa detik
                (err, token) => { // get err or token?
                    if (err) throw err;
                    res.json({ token });
                });

            // res.send('User registered');

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }

    });
// this was used to register user

module.exports = router;
