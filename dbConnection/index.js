var mysql = require('mysql');
const express = require('express');
const app = express();
const cors = require('cors') // 解决跨域
app.use(cors())
//引入路由模块文件
var router = require('./router')
const vertoken = require('../token')
const { expressjwt: jwt } = require("express-jwt");

var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'vue3Demo',
});

function query(sql, callback) {
    pool.getConnection((err, connection) => {
        connection.query(sql, (err, result, fields) => {
            callback(err, result, fields);
            connection.release();
        });
    });
}

//解析token获取用户信息
app.use((req, res, next) => {
    //注意此处token；authorization设置要与设置一致否则可能出现token为空
    var token = req.headers['authorization'];
    if (token == undefined) {
        return next();
    } else {
        vertoken.getToken(token).then((data) => {
            req.data = data;             //解析成功后返回设置基本信息（通过req.data判断是否过期）
            return next();
        }).catch((error) => {
            return next();
        })
    }
});

//验证token是否过期并规定哪些路由不需要验证
app.use(jwt({
    secret: 'zgs_first_token',
    algorithms: ['HS256']
}).unless({
    path: ['/login','/register']  //不需要验证的接口名称
}))

//token失效返回信息
app.use((err, req, res, next) => {
    if (err.status == 401) {
        return res.status(401).send('token失效');// 这样返回401 前端会直接得到报错
    }
})

//设置托管静态目录; 项目根目录+ public.可直接访问public文件下的文件eg:http://localhost:3000/images/url.jpg
app.use('/static', express.static('public'));

app.use(router)

app.listen(8081, () => { console.log('server run at 8081'); });

exports.query = query