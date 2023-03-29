const userSQL = {
    login: (params) => { return 'select * from user where username=' + `'${params.username}'` + ' and password=' + `'${params.password}'` },
    getUserList: (params) => {
        return params.userName == '' ? `select * from user  limit  ${(params.pageNum - 1) * params.pageSize},${params.pageSize}` : ` select * from user where name like '%${params.userName}%' limit  ${(params.pageNum - 1) * params.pageSize},${params.pageSize}`
    },
    getUserCount: (params) => {
        return params.userName == '' ? `select count(*) from user` : ` select count(*) from user where name like '%${params.userName}%' `
    },
    getUserById: (id) => { return 'select * from user where id =' + `'${id}'` },
    getUserByToken: (token) => { return 'select * from user where token =' + `'${token}'` },
    delUser: (id) => { return 'delete from user where id=' + `'${id}'` },
    resetToken: (username, token) => { return 'update user set token=' + `'${token}'` + 'where username=' + `'${username}'` },
}

module.exports = userSQL;