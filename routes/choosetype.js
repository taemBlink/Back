const express = require('express');
const router = express.Router();
const passport = require('passport');
const { Users } = require('../models');

// 사용자에게 유저 타입을 선택하도록 안내하는 라우트
router.get('/choose_type', (req, res) => {
  res.send(`
      <html>
      <head>
      <style>
  body {
    font-family: 'Arial', sans-serif;
    background-color: #F8F8F8;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    background-color: #FFFFFF;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    width: 400px;
    height: 400px;
    margin: 40px 0; /* Increase top and bottom margin */
  }

  h1 {
    text-align: center;
    color: #3C1E1E;
    font-size: 24px;
    margin-top: 0;
  }

  .input-container {
    display: flex;
    flex-direction: row; /* Align horizontally */
    align-items: center;
    justify-content: center; /* Center align horizontally */
    gap: 20px;
    width: 100%;
  }

  label {
    font-weight: bold;
    color: #3C1E1E;
    flex-shrink: 0;
    width: 100px;
    text-align: right;
  }

  input[type="text"],
  input[type="radio"] {
    padding: 10px;
    border: 1px solid #DADADA;
    border-radius: 4px;
    font-size: 16px;
    color: #3C1E1E;
    flex-grow: 1;
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }

  input[type="submit"] {
    padding: 10px 20px;
    background-color: #F7D100;
    color: #FFFFFF;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
  }

  input[type="submit"]:hover {
    background-color: #F8E29B;
  }
</style>
    
        <script>
            function showCompanyInput(event) {
                const userType = event.target.value;
                const companyInput = document.getElementById('company');
                if (userType === 'hr') {
                companyInput.style.display = 'flex';
                } else {
                companyInput.style.display = 'none';
                }
            }

            async function submitForm(event) {
                event.preventDefault();
                
                const userType = document.querySelector('input[name="user_type"]:checked').value;
                const company = document.querySelector('input[name="company"]').value;

                const data = { 
                user_type: userType
                };
                if (userType === 'hr' && company) {
                data.company = company;
                }

                const response = await fetch('/choose_type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                redirect: 'follow',
                credentials: 'include',
                });
                
                if (response.ok) {
                    const resData = await response.json();
                    if (resData.error) {
                        alert(resData.error);
                    } else if (resData.redirect) {
                        window.location.href = resData.redirect;
                    }
                } else {
                    const text = await response.text();
                    alert(text);
                }
            }

            window.onload = function() {
                document.querySelector('form').addEventListener('submit', submitForm);
            }
        </script>

      </head>
      <body>
        <div class="container">
          <h1>추가정보를 입력해주세요.</h1>
          <form action="/choose_type" method="post">
            <div class="input-container">
              <div>
                <input type="radio" id="regular" name="user_type" value="regular" onchange="showCompanyInput(event)" checked>
                <label for="regular">일반 회원</label>
              </div>
              <div>
                <input type="radio" id="hr" name="user_type" value="hr" onchange="showCompanyInput(event)">
                <label for="hr">인사 담당자</label>
              </div>
            </div>
            <div id="company" class="input-container" style="display: none">
              <label for="company">회사명:</label>
              <input type="text" name="company" placeholder="Company">
            </div>
            <div class="button-container">
              <input type="submit" value="확인">
            </div>
          </form>
        </div>
      </body>
      </html>
      `);
});

// 사용자가 유저 타입을 선택하고 제출했을 때 실행되는 라우트
router.post('/choose_type', async (req, res) => {
    console.log('POST /choose_type : ' + JSON.stringify(req.body));
    try {
      const { user_type: type, company } = req.body;
  
      if (['regular', 'hr'].includes(type)) {
        if (req.user) {
          if (type === 'hr' && !company) {
            res.send({ error: '회사명을 입력해주세요.' });
            return;
          }
  
          req.user.user_type = type;
          if (company) {
            req.user.company = company;
          }
  
          await req.user.update({ user_type: type, company: company });

          res.json({ redirect: 'http://react.ysizuku.com' });
  
        } else {
          res.send({ error: '로그인에 실패하였습니다.' });
          return;
        }
      } else {
        res.send({ error: '유효하지 않은 유저 타입입니다.' });
        return;
      }
    } catch (error) {
      console.log('서버 에러가 발생했습니다.', error);
      res.status(500).send('서버 에러가 발생했습니다.');
    }
  });

module.exports = router;
