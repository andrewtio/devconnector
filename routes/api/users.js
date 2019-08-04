const express = require('express');
const router = express.Router();
// use express router
const gravatar = require('gravatar');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator/check');
// you can check this in express-validator documentation (express-validator.github.io/docs)
const User = require('../../models/User');

// @route   GET api/users
// @Desc    Test route
// @access  Public
// if private then you need auth token for connect

// router.get('/', (req, res) => res.send('User route'));
// this was used to get a respond "User route"

// @route   POST api/users
// @Desc    Register route
// @access  Public

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    })
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
        const { name, email, password } = req.body; // we pull these 3 variable from req.body

        try {
            // See if user exists, we don't want multiple email
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exsists' }] });
            }

            // get users gravatar
            const avatar = gravatar.url(email, {
                s: '200', // default size
                r: 'pg', // rating, so no see naked people
                d: 'mm' // default image or user icon if user not have avatar
            })

            // create instance of a user
            user = new User({
                name,
                email,
                avatar,
                password
            });

            // Encyprt password using bycrypt
            const salt = await bycrypt.genSalt(10); // to get promise use await

            user.password = await bycrypt.hash(password, salt);

            await user.save();

            // anything that we want a promise should use await, 
            // kalo ga pake await akan banyak dot dot bersambungan dan terlihat berantakan


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