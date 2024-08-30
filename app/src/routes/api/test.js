import express from 'express';

const router = express.Router();


router.get('/admin', (req, res) => {
    req.session.user = {
        userId: 'testAdmin',
        role: 'admin'
    }
    return res.status(200).send();
});
router.get('/user', (req, res) => {
    req.session.user = {
        userId: 'testUser',
        role: 'user'
    }
    return res.status(200).send();
});
router.get('/guest', (req, res) => {
    req.session.user = {
        userId: 'testGuest',
        role: 'guest'
    }
    return res.status(200).send();
});

export default router;
