const express = require('express');
const req = require('express/lib/request');
const db = require('./index.js');
const app = express();
var bodyParser = require('body-parser');
const BASE_URL = "https://172.10.5.90:80";

app.use(bodyParser.json());

db.connect(function(err){
    if (err) console.log(error)
    else console.log("db connected!")
});

app.listen(80, () => {
    console.log("Start server");
});


// user 조회 요청 (로그인 시 등록된 유저인지 확인)
app.post("/api/findUser", (req, res) => {
    const id = req.body.id;
    console.log(id);
    db.query(
        "SELECT * FROM users WHERE id = ?", [id],
        (err, result) => {
            if (err) {
                res.send({ err : err })
            }
            if (result.length != 0) {
                res.send(result);   // 이미 가입한 회원 (val = 1)
            } else {
                res.send([{ id: "empty_user" }]);   // 회원가입하는 회원 (val = 0)
            }
        }
    )
})

// 회원가입 시 닉네임 중복 확인
app.post("/api/checkNickname", (req, res) => {
    const nickname = req.body.nickname;
    console.log(nickname);
    db.query(
        "SELECT * FROM users WHERE nickname = ?", [nickname],
        (err, result) => {
            console.log(result);
            if (err) {
                res.send({ err : err })
            }
            if (result.length != 0) {
                res.send({ msg: "duplicated" }) // 닉네임 중복
            } else {
                res.send({ msg: "unique" })
                // res.send(result);
            }
        }
    )
})

// 회원가입 시 user 등록 요청
app.post("/api/addUser", (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const place = req.body.place;   //영어로 넣기!

    db.query(
        "INSERT INTO users (id, name, nickname, email, mobile, place) VALUES (?,?,?,?,?,?)",
        [id, name, nickname, email, mobile, place],
        (err, result) => {
            if (err) {
                console.log(err);
                res.send({ msg: "Signup failed"});
            }
            res.send({ msg : "Signup successed"});
        }
    )
})

// 홈화면에서 지역별 && available한 item 띄우기
app.get('/api/getItems/:place', (req, res) => {
    let {place} = req.params;

    console.log(place);

    db.query(
        "SELECT * FROM items WHERE item_place = ? AND available = ?", [place, 1],
        (err, result) => {
            console.log(result);
            if (err) {
                res.send({ err : err })
            } else {
                res.send(result)
            }
        }
    )
})

// 아이템 등록 시 db에 저장
app.post('/api/addItem', (req, res) => {
    const user_id = req.body.user_id;
    const post_time = new Date();
    const item_image = req.body.item_image;
    const item_name = req.body.item_name;
    const item_place = req.body.item_place;
    const item_date_start = req.body.item_date_start;
    const item_date_end = req.body.item_date_end;
    const item_price = req.body.item_price;
    const item_description = req.body.item_description;


    db.query(
        "INSERT INTO items (user_id, post_time, item_image, item_name, item_place, item_date_start, item_date_end, item_price, item_description, available) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [user_id, post_time, item_image, item_name, item_place, item_date_start, item_date_end, item_price, item_description, 1],
        (err, result) => {
            if (err) {
                console.log(err);
                res.send({ msg: "addItems failed"});
            } else {
                res.send({ msg : "addItems successed"});
            }
        }
    )
})

//to_user가 빌리기 버튼을 눌렀을 때 글 작성자인 from_user와 거래를 성립함
app.post('api/borrowItem', (req, res) => {
    const from_user = req.body.from_user;
    const to_user = req.body.to_user;
    const contract_item = req.body.contract_item;
    const contract_time = new Date();

    db.query(
        "INSERT INTO contracts (from_user, to_user, contract_item, contract_time) VALUES (?,?,?,?)",
        [from_user, to_user, contract_item, contract_time],
        (err, result) => {
            if (err) {
                console.log(err);
                res.send({ msg : "borrowItem failed"});
            } else {
                res.send({ msg : "borrowItem succeeded"});
            }
        }
    )
})

// app.get('/api/users/:type', async (req, res) => {
//     let {type} = req.params;

//     console.log(type);
//     res.send('ok');
// })

app.get('/about', (req, res) => {
    console.log("about request!");
    res.send('about page')
})

app.get('/items', (req, res) => {
    console.log('this is items! /items');
    res.json(items);
})

app.post('/post', (req, res) => {
    var inputData;

    // req.on('data,')
})


let sql = "INSERT INTO users (id, name, nickname, email, mobile) VALUES(?,?,?,?,?)";
// let params = ['test', 'ticket', 600];
let users = ['abc','홍길동', '동에번쩍서에번쩍', 'gildong@naver.com', '010-1111-2222'];

// console.log('hihihi');
// db.query(sql, users, function(err, rows, fields){
//     if (err){
//         console.log(err);
//     }
//     else {
//         console.log(rows.insertId);
//     }
// })

app.get('/db/users', (req, res) => {
    db.query('SELECT * from users', (err, rows) => {
        if (err) throw error;
        console.log('User info is: ', rows);
        res.send(rows);
    });
});

app.get('/db/items', (req, res) => {
    db.query('SELECT * from items', (err, rows) => {
        if (err) throw error;
        res.send(rows);
    });
});