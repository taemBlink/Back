const express = require('express');
const router = express.Router();
const { Users } = require('../models');

// 사용자에게 유저 타입을 선택하도록 안내하는 라우트
router.get('/choose_type', (req, res) => {
    // res.send('Please choose your user type: <a href="/choose_type/regular">Regular</a> or <a href="/choose_type/hr">HR</a>');
    res.json({userTypes: ['regular', 'hr']});
});

// 유저 타입을 선택하여 해당 유저의 유저 타입을 업데이트하는 라우트
router.get('/choose_type/:type', async (req, res) => {
    const type = req.params.type; // 선택한 유저 타입 (regular 또는 hr)

    // 선택한 유저 타입이 regular 또는 hr인지 확인
    if (['regular', 'hr'].includes(type)) {
        // 로그인한 사용자인지 확인
        if (req.user) {
            req.user.user_type = type; // 유저 타입 업데이트
            await req.user.save(); // 업데이트된 유저 타입 저장

            res.redirect('/'); // 홈페이지로 리다이렉트
        } else {
            // 로그인하지 않은 사용자에게 오류 메시지 표시
            res.send('You are not logged in');
        }
    } else {
        // 유효하지 않은 유저 타입을 선택한 경우 오류 메시지 표시
        res.send('Invalid user type');
    }
});

module.exports = router;
