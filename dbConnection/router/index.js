const express = require('express');
const router = express.Router()
const userSQL = require('../mysql');
const db = require('../index')
//引入插件(关于token)
const vertoken = require('../../token/index')
const menus=[
    {
        id: '1', path: '/', name: '首页', icon: 'home', children: []
      },
      {
        id: '2', path: '/system', name: '系统管理', icon: 'system', children: [{
          id: '2-1', path: '/system/menu', name: '菜单管理', icon: 'menu', children: []
        }, {
          id: '2-2', path: '/system/role', name: '角色管理', icon: 'role', children: []
        }, {
          id: '2-3', path: '/system/user', name: '用户管理', icon: 'user', children: []
        }]
      }
]

const routes = [
    {
        id: 1, name: "/", path: "/", component: "Layout", redirect: "/index", hidden: false, children: [
            { name: "index", path: "/index", meta: { title: "index" }, component: "index/index" },
        ]
    },
    {
        id: 2, name: "/form", path: "/form", component: "Layout", redirect: "/form/index", hidden: false, children: [
            { name: "/form/index", path: "/form/index", meta: { title: "form" }, component: "form/index" }
        ]
    },
    {
        id: 3, name: "/example", path: "/example", component: "Layout", redirect: "/example/tree", meta: { title: "example" }, hidden: false, children: [
            { name: "/tree", path: "/example/tree", meta: { title: "tree" }, component: "tree/index" },
            { name: "/copy", path: "/example/copy", meta: { title: "copy" }, component: "tree/copy" }
        ]
    },
    {
        id: 4, name: "/table", path: "/table", component: "Layout", redirect: "/table/index", hidden: false, children: [
            { name: "/table/index", path: "/table/index", meta: { title: "table" }, component: "table/index" }
        ]
    },
    {
        id: 5, name: "/admin", path: "/admin", component: "Layout", redirect: "/admin/index", hidden: false, children: [
            { name: "/admin/index", path: "/admin/index", meta: { title: "admin" }, component: "admin/index" }
        ]
    },
    {
        id: 6, name: "/people", path: "/people", component: "Layout", redirect: "/people/index", hidden: false, children: [
            { name: "/people/index", path: "/people/index", meta: { title: "people" }, component: "people/index" }
        ]
    }
]

const permissions=['system:user:add','system:user:delete'];

// 登录
router.get('/login', (req, res) => {
    //获取参数
    const params = { username: req.query.username, password: req.query.password };
    if (req.query == '{}' || params.username === '' || params.password === '') {
        res.send({
            code: 0,
            message: '账户或密码不能为空'
        })
    } else {
        // 查询数据是否存在数据库中(user表没有设置索引)
        db.query(userSQL.login(params), (err, result) => {
            if (err) {
                throw err;
            } else {
                if (result.length != 0) {
                    //调用生成token的方法
                    vertoken.setToken(result[0].username).then(token => {
                        result[0].menus = menus;
                        result[0].token = token;
                        result[0].permissions = permissions;
                        res.send({
                            code: 200,
                            userInfo: result[0],
                            message: '登录成功',
                        })
                        // 把生成的token存储到数据库中
                        db.query(userSQL.resetToken(result[0].username, token), (err, result) => {
                        })

                    })
                } else {
                    res.send({
                        code: 200,
                        message: '该用户不存在',
                    })
                }
            }
        })
    }
})

// 查询当前登陆用户的信息
router.get('/user/getUserByToken', (req, res) => {
    db.query(userSQL.getUserByToken(req.query.token), (err, result) => {
        if (err) {
            res.send(err)
        } else {
            result.menus = menus;
            res.send({
                code: 200,
                data: result,
                msg: '请求数据成功',
            })
        }
    })
})

// 查询所有用户
router.get('/user/getUserList', (req, res) => {
    db.query(userSQL.getUserCount(req.query), (err1, res1) => {
        if (err1) {
            res.send(err1)
        } else if (res1[0]['count(*)'] > 0) {
            db.query(userSQL.getUserList(req.query), (err2, res2) => {
                if (err2) {
                    res.send(err2)
                } else {
                    res.send({
                        code: 200,
                        total: res1[0]['count(*)'],
                        data: res2,
                        msg: '请求数据成功',
                    })
                }
            })
        }else{
            res.send({
                code: 200,
                total: 0,
                data: [],
                msg: '请求数据成功',
            })
        }

    })

})

// 根据id删除用户
router.delete('/user/delUser', (req, res) => {
    db.query(userSQL.delUser(req.query.id), (err, result) => {
        if (result.affectedRows == 0) {
            res.send({
                code: 0,
                msg: '删除失败',
            })
        } else {
            res.send({
                code: 200,
                msg: '删除成功',
            })
        }
    })
})


module.exports = router