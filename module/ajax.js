var zz=/^[\u4e00-\u9fa5\w]\w{3,15}$/;//验证账号正则
var zz1=/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;//验证邮箱

function ajax(json){
    if(zz.test(json.no)){
        data ={
            no : json.no
        }
    }else if(zz1.test(json.no)){
        data ={
            mailbox : json.no
        }
    }else{
        data ={
            phone : json.no
        }
    }
}

module.exports = ajax;