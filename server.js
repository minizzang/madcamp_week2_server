const express = require('express');
const db = require('./index.js');
const app = express();
var bodyParser = require('body-parser');

const http = require('http').createServer(app);
const { Socket } = require('socket.io');
// const server = http.createServer(app)
const io = require('socket.io')(http)

app.use(express.json({ limit : "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ limit:"50mb", extended: false }));

db.connect(function(err){
    if (err) console.log(error)
    else console.log("db connected!")
});

http.listen(80, () => {
    console.log("Start server");
});


// socket io chatting
io.on('connection', (socket) => {
    console.log(`socket connected : ${socket.id}`)
    socket.on('enter', (data) => {
        console.log(`entered`)
        const roomData = JSON.parse(data)
        const username = roomData.username
        const roomNumber = roomData.num
        socket.join(`${roomNumber}`)
        console.log(`[Username: ${username}] entered [room number]: ${roomNumber}]`)
    })
    socket.on('newMessage', (data) => {
        const messageData = JSON.parse(data)
        console.log(`[Room Number ${messageData.to}] ${messageData.from} : ${messageData.content}`)
        io.to(`${messageData.to}`).emit('update', JSON.stringify(messageData))
    })
    socket.on('disconnect', () => {
        console.log(`socket disconnected : ${socket.id}`)
    })
})
// server.listen(80, function(){
//     console.log(`Node app is running on port 80`);
// });


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
    // const item_image = req.body.item_image;
    const item_image = "null";  // 나중에 db에서 column 없애기
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
                res.send({ msg : result.insertId });
            }
        }
    )
})

//item_id로 item 정보 찾기
app.get('/api/getItemDetail/:item_id', (req, res) => {
    let {item_id} = req.params;

    db.query(
        "SELECT * FROM items WHERE item_id = ?", [item_id],
        (err, result) => {
            if (err) {
                res.send({ err : err })
            } else {
                // console.log(result);
                res.send(result);
            }
        }
    )
})

//user_id로 user의 닉네임 찾기
app.get('/api/getUserNickname/:user_id', async (req, res) => {
    let {user_id} = req.params;

    db.query(
        "SELECT nickname FROM users WHERE id = ?", [user_id],
        (err, result) => {
            if (err) {
                res.send({ err : err })
            } else {
                res.send(result);
            }
        }
    )
})

//to_user가 빌리기 버튼을 눌렀을 때 contracts table에 row 추가
app.post('/api/borrowItem', (req, res) => {
    const from_user = req.body.from_user;
    const to_user = req.body.to_user;
    const contract_item = req.body.contract_item;
    const contract_time = new Date();

    db.query(
        "INSERT INTO contracts (from_user, to_user, contract_item, contract_time, confirm) VALUES (?,?,?,?,?)",
        [from_user, to_user, contract_item, contract_time, 0],
        (err, result) => {
            if (err) {
                console.log(err);
                res.send({ msg : "borrowItem request failed"});
            } else {
                res.send({ msg : "borrowItem request succeeded"});
            }
        }
    )
})


// 내가 빌리기를 신청한 item 목록 (input : to_user / constraint : confirm=0)
app.get('/api/getBorrowReqItems/:user_id', (req, res) => {
    let {user_id} = req.params;
    
    db.query(
        "SELECT * FROM contracts WHERE to_user = ? AND confirm = ?", [user_id, 0],
        (err, result) => {
            if (err) {
                res.send({ err : err })
            } else {
                // console.log(result);
                res.send(result);
            }
        }
    )
})

// 내가 빌려주겠다고 올린 아이템 목록 (input : user_id / output : item_id, item_name / constraint : available=1)
app.get('/api/getMyItemPosted/:user_id', async (req, res) => {
    let {user_id} = req.params;

    db.query(
        "SELECT item_id, item_name FROM items WHERE user_id = ? AND available = ?", [user_id, 1],
        (err, result) => {
            if (err) {
                res.send({ msg : "getMyItemPosted failed"});
            } else {
                res.send(result);
            }
        }
    )
})

// 내 특정 물건을 빌리고 싶어하는 사람들 닉네임 (input : from_user, item_id / constraint : confirm=0)
app.get('/api/getPeopleReqItemToMe/:user_id/:item_id', async (req, res) => {

    let {user_id, item_id} = req.params;

    db.query(
        "SELECT nickname, to_user FROM contracts JOIN users ON(users.id = contracts.to_user) WHERE from_user = ? AND contract_item = ? AND confirm = ?", [user_id, item_id, 0],
        (err, result) => {
            if (err) {
                res.send({ msg : "getPeopleReqItemToMe failed"});
            } else {
                console.log("nickname passed!");
                res.send(result);
            }
        }
    )
})

//from_user가 빌려주기 버튼을 눌렀을 때 contract item의 confirm을 1로 변경 (input : from_user, item_id, to_user)
app.post('/api/confirmBorrow', (req, res) => {
    const from_user = req.body.from_user;
    const to_user = req.body.to_user;
    const item_id = req.body.item_id;

    db.query(
        "UPDATE contracts SET confirm=1 WHERE from_user = ? AND to_user = ? AND contract_item = ?", [from_user, to_user, item_id],
        (err, result) => {
            if (err) {
                console.log(err);
                res.send({ msg : "confirmBorrow Error"});
            } else {
                //item_id가 같고 confirm이 0인 다른 row는 모두 지움
                db.query(
                    "DELETE FROM contracts WHERE contract_item = ? AND confirm = ?", [item_id, 0],
                    (err, result) => {
                        if (err) {
                            res.send({ msg : "Delete other requests Error"});
                        } else {
                            // 빌리기에 성공하면 item의 available을 0으로 변경하기
                            db.query(
                                "UPDATE items SET available=0 WHERE item_id = ?", [item_id],
                                (err, result) => {
                                    if (err) {
                                        res.send({ msg : "Update item unavailable Error"});
                                    } else {
                                        res.send({ msg : "confirmBorrow Succeeded"});
                                        console.log("confirm success 3")
                                    }
                                }
                            )
                            console.log("confirm success 2")
                        }
                    }
                )
                console.log("confirm success 1")
            }
        }
    )
})


// 내가 빌린/빌렸던 물건 목록 (input : to_user / constraint : confirm=1)
app.get('/api/getMyBorrowHistory/:user_id', (req, res) => {
    let {user_id} = req.params;
    
    db.query(
        "SELECT * FROM contracts WHERE to_user = ? AND confirm = ?", [user_id, 1],
        (err, result) => {
            if (err) {
                res.send({ err : err })
            } else {
                // console.log(result);
                res.send(result);
            }
        }
    )
})

// 내가 빌려준/빌려줬던 물건 목록 (input : from_user / constraint : confirm=1)
app.get('/api/getMyItemHistory/:user_id', (req, res) => {
    let {user_id} = req.params;
    
    db.query(
        "SELECT * FROM contracts WHERE from_user = ? AND confirm = ?", [user_id, 1],
        (err, result) => {
            if (err) {
                res.send({ err : err })
            } else {
                // console.log(result);
                res.send(result);
            }
        }
    )
})

// chatting 신청했을 때, user1이 item 주인, user2가 채팅 신청한 사람
app.post('/api/getRoomNum', (req, res) => {
    const user1_id = req.body.user1_id;
    const user2_id = req.body.user2_id;

    db.query(
        "INSERT INTO chatting_room (user1_id, user2_id) VALUES (?,?)",
        [user1_id, user2_id],
        (err, result) => {
            if (err) {
                console.log(err);
                res.send({ msg : "getRoomNum failed"});
            } else {
                console.log(result.insertId);
                res.send({ msg : result.insertId});
            }
        }
    )
})

// 내가 user1인 chatting room id와 상대 nickname return
app.get('/api/getUser1ChattingRoom/:user_id', async (req, res) => {

    let {user_id} = req.params;

    db.query(
        "SELECT nickname, room_id FROM chatting_room JOIN users ON(users.id = chatting_room.user2_id) WHERE user1_id = ?", [user_id],
        (err, result) => {
            if (err) {
                res.send({ msg : "getUser1ChattingRoom failed"});
            } else {
                console.log("getUser1ChattingRoom passed!");
                res.send(result);
            }
        }
    )
})

// 내가 user2인 chatting room id와 상대 nickname return
app.get('/api/getUser2ChattingRoom/:user_id', async (req, res) => {

    let {user_id} = req.params;

    db.query(
        "SELECT nickname, room_id FROM chatting_room JOIN users ON(users.id = chatting_room.user1_id) WHERE user2_id = ?", [user_id],
        (err, result) => {
            if (err) {
                res.send({ msg : "getUser2ChattingRoom failed"});
            } else {
                console.log("getUser2ChattingRoom passed!");
                res.send(result);
            }
        }
    )
})

let sql = "INSERT INTO users (id, name, nickname, email, mobile) VALUES(?,?,?,?,?)";
// let params = ['test', 'ticket', 600];
let users = ['abc','홍길동', '동에번쩍서에번쩍', 'gildong@naver.com', '010-1111-2222'];



// dummy data 처리용 api

app.get('/db/users', (req, res) => {
    db.query('SELECT * from users', (err, rows) => {
        if (err) throw err;
        console.log('User info is: ', rows);
        res.send(rows);
    });
});

app.get('/db/items', (req, res) => {
    db.query('SELECT * from items', (err, rows) => {
        if (err) throw err;
        res.send(rows);
    });
});

app.get('/db/contracts', (req, res) => {
    db.query('SELECT * from contracts', (err, rows) => {
        if (err) throw err;
        res.send(rows);
    });
});

app.get('/db/chatting_room', (req, res) => {
    db.query('SELECT * from chatting_room', (err, rows) => {
        if (err) throw err;
        res.send(rows);
    });
});

app.get('/db/delete/users/:user_id', (req, res) => {
    let {user_id} = req.params;

    db.query(
        "ALTER TABLE users DROP FOREIGN KEY WHERE id = ?", [user_id],
        (err, result) => {
            if (err) throw err;
            res.send({ msg : "success" })
    });
});

app.get('/db/delete/items/:item_id', (req, res) => {
    let {item_id} = req.params;

    db.query(
        "DELETE FROM items WHERE item_id = ?", [item_id],
        (err, result) => {
            if (err) throw err;
            res.send({ msg : "success" })
    });
});

app.get('/db/delete/chatting_room/:room_id', (req, res) => {
    let {room_id} = req.params;

    db.query(
        "DELETE FROM chatting_room WHERE room_id = ?", [room_id],
        (err, result) => {
            if (err) throw err;
            res.send({ msg : "success" })
    });
});