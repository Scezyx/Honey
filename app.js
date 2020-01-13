var Koa = require('koa'),
    // koaBody = require('koa-body'),
    render = require('koa-art-template'), //模板引擎
    session = require('koa-session'), //session
    serve = require('koa-static'), //静态资源中间件
    router = require('koa-router')(), //路由模块
    DB = require('./module/db'),
    bp = require('koa-bodyparser'),
    ajax = require('./module/ajax'),
    path = require('path'),
    mongoose = require('mongoose'),
    Person = require('./module/mongoose');
var app = new Koa();

app.use(bp());

mongoose.connect('mongodb://localhost:27017/FM', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//session中间件配置
app.keys = ['some secret hurr'];

const CONFIG = {
    key: 'koa:sess',
    /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    autoCommit: true,
    /** (boolean) automatically commit headers (default true) */
    overwrite: true,
    /** (boolean) can overwrite or not (default true) */
    httpOnly: true,
    /** (boolean) httpOnly or not (default true) */
    signed: true,
    /** (boolean) signed or not (default true) */
    rolling: false,
    /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false,
    /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG, app));
//session中间件配置 end

//静态资源中间件使用
console.log(__dirname);
app.use(serve(__dirname + '/static/' /*此处写文件位置*/ ));


var flag = false;
//使用模板引擎
render(app, {
    root: path.join(__dirname, 'view'),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production'
});

app.use(async (ctx, next) => {
    await next();
});

//主页
router.get('/index', async (ctx) => {
    console.log('ok');
    let goods = await DB.find('product');
    let person = await DB.find('aus');
    let news = await DB.find('news');
    await ctx.render('index', {
        news: news,
        person: person,
        goods:goods
    });
})

//登陆
router.get('/login', async (ctx) => {
    await ctx.render('login');
})
router.post('/doLogin', async (ctx) => {
    //使用对象得方式查询数据是对的

    ctx.session.user = await DB.find('user', ctx.request.body); //查询数据存入session
    if (ctx.session.user.length != 0) { //判断session内数据是否正确
        let goods = await DB.find('product');
        let person = await DB.find('aus');
        let news = await DB.find('news');
        if (ctx.session.user.user_type = "管理员") {
            await ctx.render('index');
        }
        await ctx.redirect('index', {
            news: news,
            person: person,
            goods:goods,
            user: ctx.session.user
        });
    } else {
        var mes = "账号或密码不对";
        return mes;
    }
})

//ajax
// router.get('/yz', async (ctx) => {
//     if (zz.test(ctx.request.body.no)) {
//         data = {
//             no: ctx.request.body.no
//         }
//     } else if (zz1.test(ctx.request.body.no)) {
//         data = {
//             mailbox: ctx.request.body.no
//         }
//     } else {
//         data = {
//             phone: ctx.request.body.no
//         }
//     }
//     flag = DB.find('user', data);
//     if (flag.length != 0) {
//         return '×';
//     }
//     return '√';
// })
//注册
router.get('/reg', async (ctx) => {
    await ctx.render('reg');
})
router.post('/doReg', async (ctx) => {
    let data;

    if (flag == false) {

    }
    data.pas = ctx.request.body.pas;
    data.user_type = "普通用户";
    let pd = await DB.insert("user", data);
    try {
        if (pd.result.ok) {
            await ctx.render('login');
        }
    } catch (err) {
        console.log(err);
        return;
    }
})

//产品展示
router.get('/product', async (ctx) => {
    var product = await DB.find('product');
    await ctx.render('product', {
        goods: product
    });
})

//新闻资讯
router.get('/news', async (ctx) => {
    let news = await DB.find('news');
    await ctx.render('news', {
        news: news
    });
})
//新闻详情
router.get('/newsxq', async (ctx) => {
    console.log(ctx.query);
    var idvalue = mongoose.Types.ObjectId(ctx.query.id.substring(1,ctx.query.id.length-1));//转换id为对应得obj
    var id ={
        "_id":idvalue
    };
    // //上一条
    // let syt = await DB.find('news',id).sort({_id:-1}).limit(1);
    // //下一条
    // let xyt = await DB.find('news',id).sort({_id:1}).limit(1);
    // console.log(syt+"1111"+xyt);
    let new1 = await DB.find('news',id);
    let news = await DB.find('news');
    await ctx.render('newsxq', {
        news:news,
        new1: new1[0]
    });
})

//公司概况
router.get('/company', async (ctx) => {
    let aus = await DB.find('aus');
    let team = await DB.find('recruit');
    console.log(aus);
    await ctx.render('company', {
        team: team,
        per: aus
    });
})

//蜜醇扶贫
router.get('/assist', async (ctx) => {
    let news = await DB.find('news');
    await ctx.render('assist',{
        news:news
    });
})

//产品详情
router.get('/productxq', async (ctx) => {
    var idvalue = mongoose.Types.ObjectId(ctx.query.id.substring(1,ctx.query.id.length-1));//转换id为对应得obj
    var id ={
        "_id":idvalue
    };
    var goods = await DB.find('product',id);
    console.log(goods);
    ctx.render('productxq', {
        goods: goods[0]
    })
})
.post('/product', async(ctx)=>{

    let goods;
    if(ctx.request.body==null||ctx.request.body.name==''||ctx.request.body==[]){
        goods = await DB.find('product');
    }else{
        goods = await DB.find('product',ctx.request.body);
    }
    console.log(goods);
    ctx.render('product', {
        goods: goods
    })
})

app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(8008);