const axios = require('axios');

exports.addUserSMO = async function (req, res) {
    let requestData = req.body;
    var userdetails = await GlobalService.getUserDetails(req.headers['authorization']);
    
    await FUNCTIONS.DATA_WRITE(req);
    if (requestData == undefined) {
        res.status(400);
        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
    } else {
        try{
            if (!userdetails || !userdetails.id) {
                res.status(400);
                res.json({
                  replyCode: "error",
                  replyMsg: LANGTEXT.USERNOTFOUND,
                })
              } else {
                if(requestData.acc_type === 1){
                    if (!requestData.app_Id || requestData.app_Id === '') {
                        res.status(400);
                        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
                    }
                    else if (!requestData.app_Secret || requestData.app_Secret === '') {
                        res.status(400);
                        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
                    }           
                    else if (!requestData.page_id || requestData.page_id === '') {
                        res.status(400);
                        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
                    } else if(!requestData.access_token || requestData.access_token === '') {
                        res.status(400);
                        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
                    }
                    requestData.access_token_date = new Date()
                } else if (requestData.acc_type === 2) {
                    if (!requestData.insta_username || requestData.insta_username === '') {
                        res.status(400);
                        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
                    }
                    else if (!requestData.insta_password || requestData.insta_password === '') {
                        res.status(400);
                        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
                    }            
                }
                try {
                    requestData.user_id = userdetails.id
                    requestData.status = 1;
                    await UserSMOSettings.create(requestData)
                    .then(data => {
                        res.status(201);
                        res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                    })
                    .catch(err => {
                        var errorMessage = err.errors;
                        var errorITem = [];
                        errorMessage.forEach((item) => {
                            console.log('ID: ' + item.message);
                            errorITem.push({ "field": item.path, "message": item.message });
                        });
                        res.status(400);
                        res.json({ replyCode: 'error', replyMsg: errorITem });

                    });
                } catch (error) {
                    var errorMessage = error.errors;
                    var errorITem = [];
                    errorMessage.forEach((item) => {
                        console.log('ID: ' + item.message);
                        errorITem.push({ "field": item.path, "message": item.message });
                    });
                    res.status(400);
                    res.json({ replyCode: 'error', replyMsg: errorITem });
                }
            }
        } catch(error) {
            SaveError.create({
                user_id: userdetails.id,
                file: 'controller/user_smo.js',
                api: 'addUserSMO === ',
                source: 'admin',
                err: error.toString(),
                resolved: 0
            })
            console.log('error ===', error);
            res.status(500);
            res.json({
                replyCode: 'error',
                replyMsg: LANGTEXT.DATABASECONNECTIONERROR,
            });
        }
        
    }
}

exports.instantPostOnSocialMedia = async function (req, res) {
    var requestData = req.body;
    console.log("requestData==", requestData)
    // var userdetails = await GlobalService.getUserDetails(req.headers['authorization']);
    var userdetails = requestData.user_id; // Remove this
    // await FUNCTIONS.DATA_WRITE(req);
    if (requestData == undefined) {
        res.status(400);
        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
    } else {
        try{
            if (!userdetails || !userdetails.id) {
                res.status(400);
                res.json({
                  replyCode: "error",
                  replyMsg: LANGTEXT.USERNOTFOUND,
                })
              } else {
                if(requestData.acc_type === 1){
                    UserSMOSettings.findOne({where:{status:1,user_id:userdetails.id},
                        attributes: ['insta_username', 'insta_password']}).then(async data => {
                        console.log("data---", data);
                        try {
                            const appId = data.app_id;
                            const appSecret = data.app_secret;
                            const access_token = data.access_token;
                            
                            



                            let fbSMOPostObj = {
                                user_id: requestData.user_id,
                                page_id: requestData.page_id,
                                post_type : requestData.post_type,
                                status: 1,
                            }
                            if (fbSMOPostObj.caption) {
                                fbSMOPostObj.caption = requestData.caption
                            }

                            let mediaObj = {
                                access_token : access_token
                            }
                            let mediaSource;
                            if(req.files.file != 'undefined' && req.files.file != "" && req.files.file != null && req.files.file.name != '') {
                                console.log("Image receive****");
                        
                                // const filePath = req.files.file.path;
                                const mimeType = req.files.file.type;
                                const filetype = mimeType.split('/')
                                
                                const filenamesave = FUNCTIONS.uploadImageWithoutCallback(req.files.file, env.SOCIALIMAGEUPLAODPATH);
                                if (filenamesave[1]) {
                                    userErrorMessage = true;
                                } else {
                                    fbSMOPostObj.media_file = 'resized-' + filenamesave[0];
                                    if(filetype[0] == 'videos'){
                                        mediaSource = 'videos'
                                        mediaObj.file_url = env.IMAGEBASEPATH + 'smo/' + filenamesave[0] 
                                        if(req.body.caption) {
                                            mediaObj.description = requestData.caption
                                        }
                                    } else if(filetype[0] == 'image'){
                                        mediaSource = 'photos'
                                        mediaObj.url = env.IMAGEBASEPATH + 'smo/' + filenamesave[0] 
                                        if(req.body.caption) {
                                            mediaObj.caption = requestData.caption
                                        }
                                    }  else {
                                        mediaObj.message = requestData.caption
                                        mediaSource = 'feed'
                                    }
                                }
                            }

                            fbSMOPostObj.mediaSource = mediaSource;
                            await axios.post(`https://graph.facebook.com/v19.0/${page_id}/${mediaSource}`, mediaObj)
                            .then(async function (fbPostResponse) {
                                console.log(fbPostResponse)
                                if (fbPostResponse) {
                                    try {
                                        // await UserSMOSettings.update({appId:appId},fbSMOSettingObj)
                                        
                                        await UserSMOPost.create(fbSMOPostObj)
                                        res.status(201);
                                        res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                                    } catch (error) {
                                        var errorMessage = error.errors;
                                        var errorITem = [];
                                        errorMessage.forEach((item) => {
                                            console.log('ID: ' + item.message);
                                            errorITem.push({ "field": item.path, "message": item.message });
                                        });
                                        res.status(400);
                                        res.json({ replyCode: 'error', replyMsg: errorITem });
                                    }
                                } else {
                                    res.status(500);
                                    res.json({ replyCode: 'error', replyMsg: "something went wrong" });
                                }
                            })
                            .catch(function (error) {
                                var errorMessage = error.errors;
                                var errorITem = [];
                                errorMessage.forEach((item) => {
                                    console.log('ID: ' + item.message);
                                    errorITem.push({ "field": item.path, "message": item.message });
                                });
                                res.status(400);
                                res.json({ replyCode: 'error', replyMsg: errorITem });
                            });
                        } catch (error) {
                            res.status(400);
                            res.json({ replyCode: 'error', replyMsg: error.message });
                        }
                    }).catch(err => {
                        res.status(400);
                        res.json({
                            replyCode: 'error',
                            replyMsg:LANGTEXT.DATABASECONNECTIONERROR
                        });
                    });
                } else if (requestData.acc_type === '2') {
                    UserSMOSettings.findOne({where:{status:1,user_id:userdetails.id},
                        attributes: ['insta_username', 'insta_password']}).then(async data => {
                            console.log("data---", data);
                        try {
                            let instaSMOPostObj = {
                                caption : requestData.caption,
                                user_id: userdetails.id,
                                post_type : requestData.post_type
                            }
                            const ig = new IgApiClient();
                            ig.state.generateDevice(data.insta_username);
                            ig.account.login(data.insta_username, data.insta_password).then(async () => {
                                
                                let publishResult;
                                if(req.files.file != 'undefined' && req.files.file != "" && req.files.file != null && req.files.file.name != '') {
                                    // const returnFileData = fileOperation(req.files)
                                    // instaSMOPostObj.mediaSource = returnFileData.mediaSource
                                    const filePath = req.files.file.path;
                                    const mimeType = req.files.file.type
                                    const filetype = mimeType.split('/')
                                    
                                    instaSMOPostObj.mediaSource = filetype[0];
                                    //Resize Image
                                    let width;
                                    let height;
                                    if(filetype[0] === 'image'){
                                        //Check Image size
                                        const dimensions = sizeOf(filePath)
                                        const imageSize = `${dimensions.width}x${dimensions.height}`;
                                        const standardImageSize = ['1080x1080','1080x566', '566x1080']
                                        
                                        if(!standardImageSize.includes(imageSize)){
                                            if(dimensions.width > dimensions.height){
                                                width = 1080;
                                                height = 566;
                                            } else if (dimensions.width < dimensions.height){
                                                width = 1080;
                                                height = 566;
                                            } else {
                                                width = 1080;
                                                height = 1080;
                                            }
                                        }
                                    }
                                    const filenamesave = FUNCTIONS.uploadImageWithoutCallback(req.files.file, env.SOCIALIMAGEUPLAODPATH);
                                    // let imageBuffer;
                                    if (filenamesave[1]) {
                                        userErrorMessage = filenamesave[1];
                                        // userErrorStatus = true;
                                        res.status(400);
                                        res.json({ replyCode: 'error', replyMsg: userErrorMessage });
                                    } else { 
                                        instaSMOPostObj.media_file = 'resized-' + filenamesave[0];
                                        const file_Path = env.IMAGEBASEPATH + 'smo/' + filenamesave[0];
                                        console.log(width, height);
                                        const images = await Jimp.read(file_Path);
                                        images.resize(width, height, Jimp.RESIZE_BEZIER, function (errs, resp) {
                                            if (errs) {
                                                res.status(400);
                                                res.json({ replyCode: 'error', replyMsg: 'Image dimentions should be in 1080x1080,1080x566, 566x1080 ratio' });
                                            }
                                        }).write(env.IMAGEBASEPATH + 'smo/resized-'+ filenamesave[0]);
                                        
                                        fs.unlinkSync(env.IMAGEBASEPATH + 'smo/' + filenamesave[0]);
                                    }
                                    instaSMOPostObj.media_file = 'resized-' + filenamesave[0];
                                    const file_Path = env.IMAGEBASEPATH + 'smo/' + filenamesave[0];
                                    const images = await Jimp.read(file_Path);
                                    images.resize(width, height).write(env.IMAGEBASEPATH + 'smo/resized-' + filenamesave[0]);

                                    fs.unlinkSync(env.IMAGEBASEPATH + 'smo/' + filenamesave[0]);

                                    const newFilePath = env.IMAGEBASEPATH + 'smo/resized-' + filenamesave[0];
                                    const imageBuffer = fs.readFileSync(newFilePath);
                                    let sourceObj = {
                                        uploadOptions: {
                                            isSidecar: false
                                        }
                                    }
                                    if(instaSMOPostObj.mediaSource === 'image') {
                                        const dimensions = sizeOf(instaSMOPostObj.newFilePath)
                                        sourceObj.uploadOptions.width = dimensions.width;
                                        sourceObj.uploadOptions.height = dimensions.height;
                                        sourceObj.file = imageBuffer;
                                        console.log(sourceObj);
                                        if(instaSMOPostObj.caption){
                                            sourceObj.caption = instaSMOPostObj.caption
                                        }
                                        publishResult = await ig.publish.photo(sourceObj);
                                        console.log('Post published:', publishResult);
                                    } else if(instaSMOPostObj.mediaSource === 'video') {
                                        sourceObj.uploadOptions.width = 1080;
                                        sourceObj.uploadOptions.height = 566;
                                        sourceObj.video = imageBuffer;
                                        if(instaSMOPostObj.caption){
                                            sourceObj.caption = instaSMOPostObj.caption
                                        }
                                        publishResult = await ig.publish.video(sourceObj);
                                        console.log('Post published:', publishResult);
                                    }
                                } else if(instaSMOPostObj.caption){
                                    publishResult = await ig.publish.caption(instaSMOPostObj.caption);
                                    console.log('Post Caption published response :', publishResult);
                                }

                                if(publishResult && publishResult.media && publishResult.media.id){
                                    instaSMOPostObj.post_id = publishResult.media.id;
                                    instaSMOPostObj.is_posted = 1;
                                    instaSMOPostObj.status = 1;
                                } else {
                                    res.status(400);
                                    res.json({ replyCode: 'error', replyMsg: "Cannot be post at the moment, please try after some time" });
                                }
                                try {
                                    await UserSMOPost.create(instaSMOPostObj)
                                    // console.log(newUserPost);
                                    res.status(201);
                                    res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                                } catch (error) {
                                    res.status(500);
                                    res.json({ replyCode: 'error', replyMsg: error.message });
                                }
                            }).catch ((error) =>{
                                res.status(400);
                                res.json({ replyCode: 'error', replyMsg: error.message });
                            })
                        } catch (error) {
                            res.status(400);
                            res.json({ replyCode: 'error', replyMsg: error.message });
                        }
                    }).catch(err => {
                        res.status(400);
                        res.json({
                            replyCode: 'error',
                            replyMsg:LANGTEXT.DATABASECONNECTIONERROR
                        });
                    });
                }
            }
        } catch(error) {
            SaveError.create({
                user_id: userdetails.id,
                file: 'controller/user_smo.js',
                api: '***instantPostOnSocialMedia***',
                source: 'admin',
                err: error.toString(),
                resolved: 0
            })
            res.status(500);
            res.json({
                replyCode: 'error',
                replyMsg: LANGTEXT.DATABASECONNECTIONERROR,
            });
        }
    }
}

exports.scheduledPostOnSocialMedia = async function (req, res) {
    var requestData = req.body;
    var userdetails = await GlobalService.getUserDetails(req.headers['authorization']);

    await FUNCTIONS.DATA_WRITE(req);
    const userSettingsObj = {}
    if (requestData == undefined) {
        res.status(400);
        res.json({ replyMsg: LANGTEXT.REQUIRED_DATA, replyCode: 'error'});
    } else {
        try{
            if (!userdetails || !userdetails.id) {
                res.status(400);
                res.json({
                  replyCode: "error",
                  replyMsg: LANGTEXT.USERNOTFOUND,
                })
              } else {
                if (requestData.acc_type === '2') {
                    UserSMOSettings.findOne({where:{status:1,user_id:userdetails.id},
                        attributes: ['insta_username', 'insta_password']}).then(async data => {
                        try {
                            let instaSMOPostObj = {
                                caption : requestData.caption,
                                user_id: userdetails.id,
                                post_type : requestData.post_type,
                                is_posted: 0,
                                schedule_date: requestData.schedule_date,
                                schedule_time: requestData.schedule_time
                            }
                            if(req.files.file != 'undefined' && req.files.file != "" && req.files.file != null && req.files.file.name != '') {
                                // const returnFileData = fileOperation(req.files)
                                // instaSMOPostObj.mediaSource = returnFileData.mediaSource

                                const filePath = req.files.file.path;
                                const mimeType = req.files.file.type
                                const filetype = mimeType.split('/')
                                console.log("mimeType===",filetype[0]);
                                
                                
                                instaSMOPostObj.mediaSource = filetype[0];
                                //Resize Image
                                let width;
                                let height;
                                if(filetype[0] === 'image'){
                                    //Check Image size
                                    const dimensions = sizeOf(filePath)
                                    console.log(dimensions)
                                    const imageSize = `${dimensions.width}x${dimensions.height}`;
                                    const standardImageSize = ['1080x1080','1080x566', '566x1080']
                                    
                                    if(!standardImageSize.includes(imageSize)){
                                        if(dimensions.width > dimensions.height){
                                            width = 1080;
                                            height = 566;
                                        } else if (dimensions.width < dimensions.height){
                                            width = 1080;
                                            height = 566;
                                        } else {
                                            width = 1080;
                                            height = 1080;
                                        }
                                    }
                                }
                                console.log(req.files)
                                const filenamesave = FUNCTIONS.uploadImageWithoutCallback(req.files.file, env.SOCIALIMAGEUPLAODPATH);
                                if (filenamesave[1]) {
                                    userErrorMessage = filenamesave[1];
                                    // userErrorStatus = true;
                                    res.status(400);
                                    res.json({ replyCode: 'error', replyMsg: userErrorMessage });
                                } else {
                                    instaSMOPostObj.media_file = 'resized-' + filenamesave[0];
                                    const file_Path = env.IMAGEBASEPATH + 'smo/' + filenamesave[0];
                                    const images = await Jimp.read(file_Path);                                    
                                    images.resize(width, height, Jimp.RESIZE_BEZIER, function (errs, resp) {
                                        if (errs) {
                                            res.status(400);    
                                            res.json({ replyCode: 'error', replyMsg: 'Image dimentions should be in 1080x1080,1080x566, 566x1080 ratio' });
                                        }
                                    }).write(env.IMAGEBASEPATH + 'smo/resized-'+ filenamesave[0]);
                                    fs.unlinkSync(env.IMAGEBASEPATH + 'smo/' + filenamesave[0]);
                                }
                            }
                            
                            
                            try {
                                console.log('instaSMOPostObj*****', instaSMOPostObj)
                                //MongoDB Connection
                                // await db.mongoc.connect();
                                // var dbo = db.mongoc.db("fareboutique");
                                // dbo.collection("user_smo_post").insertOne(instaSMOPostObj, function(err, res) {
                                //     if (err) throw err;
                                //     console.log("1 document inserted");
                                //     dbo.close();
                                // });  


                                await UserSMOPost.create(instaSMOPostObj)
                                res.status(201);
                                res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                            } catch (error) {
                                res.status(400);
                                res.json({ replyCode: 'error', replyMsg: error.message });
                            }                            
                        } catch (error) {
                            res.status(400);
                            res.json({ replyCode: 'error', replyMsg: error.message });
                        }
                    }).catch(err => {
                        res.status(400);
                        res.json({
                            replyCode: 'error',
                            replyMsg:LANGTEXT.DATABASECONNECTIONERROR
                        });  
                    });                    
                }
            }
        } catch(error) {
            SaveError.create({
                user_id: userdetails.id,
                file: 'controller/user_smo.js',
                api: '***scheduledPostOnSocialMedia***',
                source: 'admin',
                err: error.toString(),
                resolved: 0
            })
            res.status(500);
            res.json({
                replyCode: 'error',
                replyMsg: LANGTEXT.DATABASECONNECTIONERROR,
            });
        }
    }
}

exports.smoPostCron = async function (req, res) {
    try {
        const credentialsPost = await UserSMOSettings.findAll({
            where: { status: 1 },
            attributes: ['user_id','insta_password', 'insta_username']
        })
        async.forEachSeries(credentialsPost, async (val) => {
            const scheduledPost = await UserSMOPost.findAll({ where: { is_posted: 0, user_id: val.user_id } });
            async.forEachSeries(scheduledPost, async (postValue) => {
            // for (const postValue of scheduledPost) {
                if (val.user_id === postValue.user_id) {
                    const d = new Date();
                    // const today = d.getDate();

                    const hours = d.getHours();
                    const scheduledHour = postValue.schedule_time.split(':')
                     
                    const todayDate = getTodayDateTime();
                    // const scheduledDate = postValue.schedule_date.split('-');
                    // const todayDate = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`
                    console.log(postValue.schedule_date, todayDate, hours , Number(scheduledHour[0]));
                    if (postValue.schedule_date == todayDate && hours >= Number(scheduledHour[0])) {
                        if (postValue.post_type == 1) {
                            // Handle post_type 1
                        } else if (postValue.post_type == 2) {
                            let instaSMOPostObj = {};
                            const ig = new IgApiClient();
                            ig.state.generateDevice(val.insta_username);
                            await ig.account.login(val.insta_username, val.insta_password);
                            let publishResult;
                            if (postValue.media_file) {
                                let filePath = env.IMAGEBASEPATH + 'smo/' + postValue.media_file;
                                const imageBuffer = fs.readFileSync(filePath);
                                let sourceObj = {
                                    uploadOptions: {
                                        isSidecar: false
                                    }
                                };
                                if (postValue.mediaSource === 'image') {
                                    const dimensions = sizeOf(filePath);
                                    sourceObj.uploadOptions.width = dimensions.width;
                                    sourceObj.uploadOptions.height = dimensions.height;
                                    sourceObj.file = imageBuffer;
                                    if (postValue.caption) {
                                        sourceObj.caption = postValue.caption;
                                    }
                                    publishResult = await ig.publish.photo(sourceObj);
                                    console.log('Post published:', publishResult);
                                } else if (postValue.mediaSource === 'video') {
                                    sourceObj.uploadOptions.width = 1080;
                                    sourceObj.uploadOptions.height = 566;
                                    sourceObj.video = imageBuffer;
                                    if (postValue.caption) {
                                        sourceObj.caption = postValue.caption;
                                    }
                                    publishResult = await ig.publish.video(sourceObj);
                                    console.log('Post published:', publishResult);
                                }
                            } else if (!postValue.mediaSource && postValue.caption) {
                                publishResult = await ig.publish.caption(postValue.caption);
                                console.log('Post published:', publishResult);
                            }
                            if (publishResult && publishResult.media && publishResult.media.id) {
                                instaSMOPostObj.post_id = publishResult.media.id;
                                instaSMOPostObj.is_posted = 1;
                                instaSMOPostObj.status = 1;
                                await UserSMOPost.update(instaSMOPostObj, { where: { id: postValue.id } });
                            } 
                        }
                    }
                }
            // }
            })
        });
        res.status(201);
        res.json({ replyMsg: 'Data post successfully!', replyCode: 'success' });
        
    } catch (error) {
        res.status(400);
        res.json({ replyCode: 'error', replyMsg: error.message });
    }
}

exports.deletePost = async function (req, res) {    
    var requestData = req.body;
    var userdetails = await GlobalService.getUserDetails(req.headers['authorization']);
    // console.log(requestData);
    await FUNCTIONS.DATA_WRITE(req);
    
    if (requestData == undefined) {
        res.status(400);
        res.json({
        replyMsg: LANGTEXT.REQUIRED_DATA,
        replyCode: 'error',
        });
    } else {
        if(requestData.acc_type === 1){
            const page_post_id = requestData.page_post_id;
            
            await axios.delete(`https://graph.facebook.com/v19.0/${page_post_id}`)
            .then((response) => {
                if(response.success){
                    UserSMOPost.update({status: '0'}, { where: { id: requestData.id }})
                    .then(data => {
                        console.log(data)
                        res.status(201);
                        res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                    })
                    .catch(err => {
                        console.log("Error===", err);
                        res.status(400);
                        res.json({ replyCode: 'error', replyMsg: err.message });

                    });
                }
            })
            .catch((error) => {
                res.status(400);
                res.json({ replyCode: 'error', replyMsg: error.message });
            });
        } else if (requestData.acc_type === 2) {
            try {
                UserSMOSettings.findOne({where:{status:1,user_id:userdetails.id},
                    attributes: ['insta_username', 'insta_password']
                }).then(async data => {
                    try {
                        const ig = new IgApiClient();
                        ig.state.generateDevice(data.insta_username);
                        // await ig.simulate.preLoginFlow();
                        await ig.account.login(data.insta_username, data.insta_password).then(async (data) => {
                            console.log(data);
                            // Print the list of posts
                            // const feed = ig.feed.user(ig.state.cookieUserId);
                            // const posts = await feed.items();
                            // posts.forEach(post => {
                            //     console.log('Post ID:', post.id);
                            // });
                            const deletePost = await ig.media.delete({ mediaId: requestData.post_id });
                            console.log(deletePost);
                            if(deletePost.did_delete && deletePost.did_delete === true){
                                await UserSMOPost.update({status: 0}, { where: { post_id: requestData.post_id }})
                                .then(data => {
                                    console.log(data)
                                    res.status(201);
                                    res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                                })
                                .catch(err => {
                                    var errorMessage = error.errors;
                                    var errorITem = [];
                                    errorMessage.forEach((item) => {
                                        console.log('ID: ' + item.message);
                                        errorITem.push({ "field": item.path, "message": item.message });
                                    });
                                    res.status(400);
                                    res.json({ replyCode: 'error', replyMsg: errorITem });
                                });
                            } else {
                                res.status(400);
                                res.json({ replyCode: 'error', replyMsg: 'Post cannot be delete at the moment, Please try again later !!!' });
                            }
                            
                        });
                    } catch (error) {
                        res.status(400);
                        res.json({ replyCode: 'error', replyMsg: error.message });
                    }
                }).catch(err => {
                    res.status(400);
                    res.json({
                        replyCode: 'error',
                        replyMsg:LANGTEXT.DATABASECONNECTIONERROR
                    });  
                }); 
            } catch (error) {
                SaveError.create({
                    user_id: userdetails.id,
                    file: 'final/controller/user_smo.js',
                    api: '***deletePost***',
                    source: 'admin',
                    err: error.toString(),
                    resolved: 0
                })
                res.status(500);
                res.json({
                    replyCode: 'error',
                    replyMsg: LANGTEXT.DATABASECONNECTIONERROR,
                });
            }
        }
    }
}

exports.getAllPost = async function(req, res) {
    var userdetails = await GlobalService.getUserDetails(req.headers['authorization']);
    await FUNCTIONS.DATA_WRITE(req);
    try {
        // const data = await UserSMOPost.findAll({ where: {status:1,user_id:userdetails.id} });
        await UserSMOPost.findAll({where:{status:1,user_id:userdetails.id}
        }).then(data => {
            res.status(200);
            res.json({ replyMsg: 'Data successfully Fetched!', replyCode: 'success', data: data });
        }).catch(err => {
            res.status(400);
            res.json({
                replyCode: 'error',
                replyMsg:LANGTEXT.DATABASECONNECTIONERROR
            });  
        }); 
    } catch (error) {
        SaveError.create({
            user_id: userdetails.id,
            file: 'final/controller/user_smo.js',
            api: '***getAllPost***',
            source: 'admin',
            err: error.toString(),
            resolved: 0
        })
        res.status(500);
        res.json({
            replyCode: 'error',
            replyMsg: LANGTEXT.DATABASECONNECTIONERROR,
        });
    }
}

exports.getFilteredPost = async function(req, res) {
    var userdetails = await GlobalService.getUserDetails(req.headers['authorization']);
    await FUNCTIONS.DATA_WRITE(req);
    try {
        let searchObj = {
            user_id:userdetails.id,
            status:req.query.status, 
            post_type: req.query.post_type,
            createdAt: {
                [Op.between]: [req.query.from, req.query.to]
            }
        }
        // const data = await UserSMOPost.findAll({ where: searchObj });
        // res.status(200);
        // res.json({ replyMsg: 'Data successfully Fetched!', replyCode: 'success', data: data });
        UserSMOPost.findAll({where: searchObj
        }).then(data => {
            res.status(200);
            res.json({ replyMsg: 'Data successfully Fetched!', replyCode: 'success', data: data });
        }).catch(err => {
            console.log('err---------', err);
            res.status(400);
            res.json({
                replyCode: 'error',
                replyMsg:LANGTEXT.DATABASECONNECTIONERROR
            });  
        }); 
    } catch (error) {
        console.log("----------", error);
        SaveError.create({
            user_id: userdetails.id,
            file: 'final/controller/user_smo.js',
            api: '***getFilteredPost***',
            source: 'admin',
            err: error.toString(),
            resolved: 0
        })
        res.status(500);
        res.json({
            replyCode: 'error',
            replyMsg: LANGTEXT.DATABASECONNECTIONERROR,
        });
    }
}

exports.updateSinglePost = async function(req, res) {
    const requestData = req.body;
    console.log(req.params);
    console.log(requestData);
    var userdetails = await GlobalService.getUserDetails(req.headers['authorization']);
    await FUNCTIONS.DATA_WRITE(req);
    try {
        await UserSMOPost.findOne({where: {id:req.params.id}
        }).then(async data => {
            requestData.postData = data;
            if(data.status == 1){
                if (requestData.post_type == 2) {
                    console.log("111111111");
                    let returnData;
                    if (req.files.file) {
                        requestData.file = req.files.file;
                        returnData = reSchedulePostImage(requestData)
                        console.log("returnData------", returnData);
                    }
                    try {
                        const dataToSave = {
                            
                        }
                        await UserSMOPost.create(dataToSave)
                        res.status(201);
                        res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                    } catch (error) {
                        res.status(400);
                        res.json({ replyCode: 'error', replyMsg: error.message });
                    }
                }
            } else{
                if (requestData.post_type == 2) {
                    console.log("22222222222");
                    if (req.files.file) {
                        requestData.file = req.files.file;
                        const returnData = reSchedulePostImage(requestData)
                        console.log("returnData------", returnData);
                    }
                    
                    try {
                        const dataToSave = {
                            
                        }
                        await UserSMOPost.create(dataToSave)
                        res.status(201);
                        res.json({ replyMsg: 'Data successfully inserted!', replyCode: 'success', data: data });
                    } catch (error) {
                        res.status(400);
                        res.json({ replyCode: 'error', replyMsg: error.message });
                    }
                }
            }
            res.status(200);
            res.json({ replyMsg: 'Data successfully Fetched!', replyCode: 'success', data: data });
        }).catch(err => {
            console.log('err---------', err);
            res.status(400);
            res.json({
                replyCode: 'error',
                replyMsg:LANGTEXT.DATABASECONNECTIONERROR
            });  
        }); 
    } catch (error) {
        console.log("----------", error);
        SaveError.create({
            user_id: userdetails.id,
            file: 'final/controller/user_smo.js',
            api: '***getFilteredPost***',
            source: 'admin',
            err: error.toString(),
            resolved: 0
        })
        res.status(500);
        res.json({
            replyCode: 'error',
            replyMsg: LANGTEXT.DATABASECONNECTIONERROR,
        });
    }
}


const reSchedulePostImage = async function(requestData){
    console.log(requestData)
    if(requestData.file != 'undefined' && requestData.file != "" && requestData.file != null && requestData.file.name != '') {
        console.log("Image receive****");

        const filePath = requestData.file.path;
        const mimeType = requestData.file.type;
        const filetype = mimeType.split('/')
        requestData.mediaSource = filetype[0]
        //Resize Image
        let width;
        let height;
        if(filetype[0] === 'image'){
            //Check Image size
            const dimensions = sizeOf(filePath)
            console.log(dimensions)
            const imageSize = `${dimensions.width}x${dimensions.height}`;
            const standardImageSize = ['1080x1080','1080x566', '566x1080']
            
            if(!standardImageSize.includes(imageSize)){
                if(dimensions.width > dimensions.height){
                    width = 1080;
                    height = 566;
                } else if (dimensions.width < dimensions.height){
                    width = 1080;
                    height = 566;
                } else {
                    width = 1080;
                    height = 1080;
                }
            }
        }
        const filenamesave = FUNCTIONS.uploadImageWithoutCallback(requestData.file, env.SOCIALIMAGEUPLAODPATH);
        if (filenamesave[1]) {
            userErrorMessage = filenamesave[1];
            return {error:'error', replyMsg: 'file upload error'}  
        } else {
            requestData.media_file = 'resized-' + filenamesave[0];
            const file_Path = env.IMAGEBASEPATH + 'smo/' + filenamesave[0];
            const images = await Jimp.read(file_Path);
            images.resize(width, height, Jimp.RESIZE_BEZIER, function (errs, resp) {
                if (errs) {
                    return {error:errs, replyMsg: 'Image dimentions should be in 1080x1080,1080x566, 566x1080 ratio'}  
                    // res.json({ replyCode: 'error', replyMsg: 'Image dimentions should be in 1080x1080,1080x566, 566x1080 ratio' });
                }
            }).write(env.IMAGEBASEPATH + 'smo/resized-'+ filenamesave[0]);
            fs.unlinkSync(env.IMAGEBASEPATH + 'smo/' + filenamesave[0]);
            if(requestData.postData.media_file){
                fs.unlinkSync(env.IMAGEBASEPATH + 'smo/' + requestData.postData.media_file);
            }
        }
    } 
    return requestData;
}


const extendToken = async function(requestData) {
    const appId = requestData.appId;
    const appSecret = requestData.appSecret;
    const shortLivedToken = requestData.access_token;

    axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`)
    .then(response => {
        const longLivedToken = response.data.access_token;
        console.log('Long-lived Token:', longLivedToken);
        return longLivedToken
    })
    .catch(error => {
        console.error('Error extending access token:', error.response.data);
        return error
    });
}

const getTodayDateTime = function(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = dd + '-' + mm + '-' + yyyy;
    console.log(today);
    return today
}


const calculateDate = async function(tokenDate){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return `${dd}-${mm}-${yyyy}`
}



const fileOperation = async function(reqFile){
    const fileSMOPostObj = {};
    const filePath = reqFile.file.path;
    const mimeType = reqFile.file.type
    const filetype = mimeType.split('/')
    
    fileSMOPostObj.mediaSource = filetype[0];
    //Resize Image
    if(filetype[0] === 'image'){
        //Check Image size
        const dimensions = sizeOf(filePath)
        console.log(dimensions)
        const imageSize = `${dimensions.width}x${dimensions.height}`;
        const standardImageSize = ['1080x1080','1080x566', '566x1080']
        
        if(!standardImageSize.includes(imageSize)){
            if(dimensions.width > dimensions.height){
                // width = 1080;
                // height = 566;
                fileSMOPostObj.width = 1080;
                fileSMOPostObj.height = 566;
            } else if (dimensions.width < dimensions.height){
                // width = 566;
                // height = 1080;
                fileSMOPostObj.width = 566;
                fileSMOPostObj.height = 1080;
            }
        }
    }
    filenamesave = FUNCTIONS.uploadImageWithoutCallback(reqFile.file, env.SOCIALIMAGEUPLAODPATH);
    if (filenamesave[1]) {
        userErrorMessage = filenamesave[1];
        userErrorStatus = true;
    } else {
        fileSMOPostObj.media_file = 'resized-' + filenamesave[0];
        const file_Path = env.IMAGEBASEPATH + 'smo/' + filenamesave[0];
        const images = await Jimp.read(file_Path);                                    
        images.resize(fileSMOPostObj.width, fileSMOPostObj.height, Jimp.RESIZE_BEZIER, function (errs, resp) {
            if (errs) {
                res.status(400);    
                res.json({ replyCode: 'error', replyMsg: 'Image dimentions should be in 1080x1080,1080x566, 566x1080 ratio' });
            }
        }).write(env.IMAGEBASEPATH + 'smo/resized-'+ filenamesave[0]);
        fs.unlinkSync(env.IMAGEBASEPATH + 'smo/' + filenamesave[0]);
    }
    return fileSMOPostObj;
} 

const instaFilePost = async function(){
    const imageBuffer = fs.readFileSync(newFilePath);
    let sourceObj = {
        uploadOptions: {
            isSidecar: false
        }
    }
    if(postValue.mediaSource === 'image') {
        const dimensions = sizeOf(newFilePath)
        sourceObj.uploadOptions.width = dimensions.width;
        sourceObj.uploadOptions.height = dimensions.height;
        sourceObj.file = imageBuffer;
        if(postValue.caption){
            sourceObj.caption = postValue.caption
        }
        publishResult = await ig.publish.photo(sourceObj);
        console.log('Post published:', publishResult);
    } else if(postValue.mediaSource === 'video') {
        sourceObj.uploadOptions.width = 1080;
        sourceObj.uploadOptions.height = 566;
        sourceObj.video = imageBuffer;
        if(postValue.caption){
            sourceObj.caption = postValue.caption
        }
        publishResult = await ig.publish.video(sourceObj);
        console.log('Post published:', publishResult);
    }
    
    return {sourceObj, publishResult};
}