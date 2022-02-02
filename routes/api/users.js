const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { BadRequest, Conflict, Unauthorized, NotFound } = require("http-errors");
const { joiRegisterSchema, joiLoginSchema } = require("../../models/user");
const { User } = require('../../models')
const router = express.Router();
const { authenticate, upload } = require('../../middlewares/index')
const gravatar = require('gravatar');
const fs = require("fs");
const path = require("path");
const avatarsDir = path.join(__dirname, "../../", "public", "avatars");
const Jimp = require("jimp");
const { SECRET_KEY, SITE_NAME } = process.env;
const { sendEmail } = require('../../helpers');
const { nanoid } = require("nanoid");


router.post("/signup", async (req, res, next) => {
    try {
        const { error } = joiRegisterSchema.validate(req.body);
        if (error) {
            throw new BadRequest(error.message);
        }
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            throw new Conflict("Email in use");
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const verificationToken = nanoid();
        const avatarURL = gravatar.url(email);
        const newUser = await User.create({
            name,
            email,
            verificationToken,
            password: hashPassword,
            avatarURL
        });
        const data = {
            to: email,
            subject: "Подтверждение email",
            html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердить email</a>`
        }
        await sendEmail(data);

        res.status(201).json({
            user: {
                name: newUser.name,
                email: newUser.email,
            }
        })
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { error } = joiLoginSchema.validate(req.body);
        if (error) {
            throw new BadRequest(error.message);
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Unauthorized("Email or password is wrong");
        }
        if (!user.verify) {
            throw new Unauthorized("Email not verify");
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            throw new Unauthorized("Email or password is wrong");
        }
        const { _id, name } = user;
        const payload = {
            id: _id
        };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
        await User.findByIdAndUpdate(_id, { token });
        res.json({
            token,
            user: {
                email,
                name
            }
        })
    } catch (error) {
        next(error);
    }
})

router.get("/logout", authenticate, async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).send();
});

router.get("/current", authenticate, async (req, res) => {
    const { name, email } = req.user;
    res.json({
        user: {
            name,
            email
        }
    })
})

router.patch("/avatars", authenticate, upload.single("avatar"), async (req, res) => {
    console.log(req.file);
    const { filename } = req.file;
    const tempUpload = req.file.path;
    const [extension] = filename.split(".").reverse();
    const newFileName = `${req.user._id}.${extension}`;
    const fileUpload = path.join(avatarsDir, newFileName);
    await fs.promises.rename(tempUpload, fileUpload);
    Jimp.read(fileUpload)
        .then(image => {
            return image
                .resize(256, 256)
                .write(fileUpload);
        })
        .catch(err => {
            console.error(err);
        });
    await User.findByIdAndUpdate(req.user._id, { avatarURL: fileUpload }, { new: true });
    res.json({ avatarURL: fileUpload })
});

router.post("/verify", async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new BadRequest("missing required field email");
        }
        const user = await User.findOne({ email });
        if (!user) {
            throw new NotFound('User not found');
        }
        if (user.verify) {
            throw new BadRequest("Verification has already been passed")
        }

        const { verificationToken } = user;
        const data = {
            to: email,
            subject: "Подтверждение email",
            html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердить email</a>`
        }

        await sendEmail(data);

        res.json({ message: "Verification email sent" });
    } catch (error) {
        next(error);
    }
})

router.get("/verify/:verificationToken", async (req, res, next) => {
    try {
        const { verificationToken } = req.params;
        const user = await User.findOne({ verificationToken });
        if (!user) {
            throw new NotFound('User not found');
        }
        await User.findByIdAndUpdate(user._id, { verificationToken: null, verify: true });
        res.json({
            message: 'Verification successful'
        })
    } catch (error) {
        next(error);
    }
})

module.exports = router;