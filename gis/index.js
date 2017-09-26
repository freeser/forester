(function () {
    /**
     * 选中地图上区县
     */
    function getDistLineAndToShow(organId) {
        $.get(Home_Ctrl + 'GetOrganGeometry', {
            organId: organId
        }).done(function (d) {
            jumpToUnitZone(d);
        });
    }
    GIS$.getDistLineAndToShow = getDistLineAndToShow;
    /**
     * 选中护林员并显示详情
     */
    function getUserInfoAndToShow(options, fn) {
        $.get(QueryUser_Ctrl + 'GetUserInfoById', options).done(function (d) {
            (typeof fn == 'function') && fn(d);
            //加载副面板
            Page.showInfo('forester', options, d);

            var user = d.UserInfo || {};
            var gps = d.GpsInfo || {};

            jumpToHly({
                UserId: user.ID,
                UserName: user.USER_NAME,
                Longitude: gps.LONGITUDE,
                Latitude: gps.LATITUDE,
                Provider: gps.PROVIDER,
                onlineState: gps.ONLINESTATE
            });
        });
    }
    GIS$.getUserInfoAndToShow = getUserInfoAndToShow;

    function getLineInfoAndShow(options, fn){
        $.get(QueryGPSInfo_Ctrl + 'GetLineDetailInfo', {
            lineId: options.lineId
        }).done(function (data) {
            (typeof fn == 'function') && fn(data);
            //加载副面板
            Page.showInfo('road', {
                lineId: options.lineId,
                userId: data.LbsUserBaseInfo.ID
            }, {
                LineInfo: {
                    kid: 'road',
                    date: data.StartTime,
                    time: data.StartTime.split(' ')[1],
                    hour: data.TimeLength,
                    km: data.Distance,
                    userName: data.LbsUserBaseInfo.USER_NAME,
                    tel: data.LbsUserBaseInfo.PHONE_NUM,
                    userId: data.LbsUserBaseInfo.ID
                }
            });
        });
    }
    GIS$.getLineInfoAndShow = getLineInfoAndShow;
    
    function getAreaInfoAndShow(options, fn){
        $.get(ManagePatrol_Ctrl + 'GetPatrolAreaForEdit', {
            patrolAreaId: options.areaId
        }).done(function (data) {
            (typeof fn == 'function') && fn(data);
            //加载副面板
            Page.showInfo('area', {
                areaId: options.areaId,
                userId: data.PatrolAreaUsers[0].ID
            }, {
                AreaInfo: {
                    kid: 'area',
                    areaname: data.PatrolAreaInfo.AREANAME,
                    areacode: data.PatrolAreaInfo.BH,
                    area: data.PatrolAreaInfo.AREA,
                    userName: data.PatrolAreaUsers[0].USER_NAME,
                    tel: data.PatrolAreaUsers[0].PHONE_NUM,
                    userId: data.PatrolAreaUsers[0].ID
                }
            });
        });
    }
    GIS$.getAreaInfoAndShow = getAreaInfoAndShow;

    function getC119InfoAndShow(options, fn){
        $.get(QueryAlrma_Ctrl + 'GetAlarmInfo', {
            alarmId: options.c119Id
        }).done(function (data) {
            (typeof fn == 'function') && fn(data);
            //加载副面板
            data.AlarmInfo.LBSUSERINFO = data.AlarmInfo.LBSUSERINFO || {};
            Page.showInfo('c119', {
                c119Id: options.c119Id,
                userId: data.AlarmInfo.USER_ID
            }, {
                C119Info: {
                    kid: 'c119',
                    alarmname: TYPE119[data.AlarmInfo.ALARMTYPE] || '其它',
                    alarmcode: data.AlarmInfo.ALARMTYPE,
                    date: data.AlarmInfo.ALARMTIME.Date('yyyy-MM-dd hh:mm'),
                    organ: data.AlarmInfo.AlarmOrgan,
                    lat: data.AlarmInfo.LATITUDE,
                    lon: data.AlarmInfo.LONGITUDE,
                    conent: data.AlarmInfo.DESCRIPTION,
                    userName: data.AlarmInfo.LBSUSERINFO.USER_NAME,
                    tel: data.AlarmInfo.LBSUSERINFO.PHONE_NUM,
                    userId: data.AlarmInfo.USER_ID
                }
            });
        });
    }
    GIS$.getC119InfoAndShow = getC119InfoAndShow;
    
    function getHotInfoAndShow(options, fn){
        $.get(QueryHotSpot_Ctrl + 'GetHotspotById', {
            hotspotId: options.hotId
        }).done(function (data) {
            (typeof fn == 'function') && fn(data);
            //加载副面板
            Page.showInfo('hot', {
                hotId: options.hotId,
                userId: data.LBSUSERINFO[0].ID
            }, {
                HotInfo: {
                    kid: 'hot',
                    hotname: data.HOTSPOT_NO,
                    hotsource: data.HOTSPOT_SOURCE,
                    date: data.REPORT_TIME.Date('yyyy-MM-dd hh:mm'),
                    organ: data.HOTSPOT_SITE,
                    lat: data.LATITUDE,
                    lon: data.LONGITUDE,
                    userName: data.LBSUSERINFO[0].USER_NAME,
                    tel: data.LBSUSERINFO[0].PHONE_NUM,
                    userId: data.LBSUSERINFO[0].ID
                }
            });
        });
    }
    GIS$.getHotInfoAndShow = getHotInfoAndShow;
    /**
     * 绘制路径
     */
    GIS$.DrawToMap = function(pageId, options, info) {
        var arr = getCurrPanelInfo(options);
        console.log('DrawToMap', arr);
        switch(pageId){
            case 'forester':
                alert('未处理');
                break;
            case 'road':
                options.pageId == 'road' ? startGjTheme(info) : addGjToTheme(arr[0], arr[1], info);
                break;
            case 'area':
                options.pageId == 'area' ? startXhqTheme(info) : addXhqToTheme(arr[0], arr[1], info);
                break;
            case 'c119':
                options.pageId == 'c119' ? startBjTheme(info) : addBjToTheme(arr[0], arr[1], info);
                break;
            case 'hot':
                options.pageId == 'hot' ? startRdTheme(info) : addRdToTheme(arr[0], arr[1], info);
                break;
            case 'pointer':
                selectKeyPoint(info);
                break;
        }
    }
    function getCurrPanelInfo(options){
        switch(options.pageId){
            case 'forester':
                return ['护林员', options.userId];
            case 'road':
                return ['轨迹', options.lineId];
            case 'area':
                return ['巡护区', options.areaId];
            case 'c119':
                return ['报警', options.c119Id];
            case 'hot':
                return ['热点', options.hotId];
            case 'attend':
                return ['考勤', options.attendId];
        }
    }
    /*==============================基本模块接口=============================*/
    /**
     * 地图初始化
     */
    function mapInit() {
        //地图初始化
        hlyMapService = new Hly.HlyMapService({
            serviceUrlConfig: serviceUrlConfig,
            baseMapUrls: BASEMAPURLS,
            mapContainer: 'openlayerContent',
            terrainProviderUrl: TERRAINPROVIDERURL,
            xhqMapUrls: XHQMAPURLS,
        });
        hlyMapService.init();
        hlyMap = hlyMapService.hlyMap;
        //默认挂接巡护区点击查询功能
        hlyMapService.on("xhqMouseClick", function (e) {
            //有切片且有数据时触发
            //todo 打开右侧巡护区面板（showXhq方法可在获取面板信息后调用并传值）
            hlyMapService.showXhq(null, null, e.item);
        });
        mapClickEvent(); //挂载事件
        gjdMapOverEvent(); //挂载关键点事件
    }
    GIS$.mapInit = mapInit;

    /**
     * 点击事件挂接
     */
    function mapClickEvent() {
        hlyMapService.on("themeLayerPointerClick", function (e) {
            //显示到界面
            console.log("点击" + e.layerType, "项ID：" + e.itemId, "对象所属专题:" + e.themeBelongsTo, "所属专题ID:" + e.itemIdBelongsTo, "是否为专题要素对象:" + e.isThemeItem);
            var belongs = getPageId(e.themeBelongsTo);
            var curr = getPageId(e.layerType);

            panelInfoShow(belongs || curr, e.itemIdBelongsTo || e.itemId);
        });
    }
    function panelInfoShow(pageId, id) {
        switch (pageId) {
            case "c119":
                getC119InfoAndShow({
                    c119Id: id
                });
                break;
            case "feedback":
                break;
            case "road":
                getLineInfoAndShow({
                    lineId: id.split(':')[0]
                });
                break;
            case "pointer":
                break;
            case "hot":
                getHotInfoAndShow({
                    hotId: id
                });
                break;
            case "forester":
                getUserInfoAndToShow({
                    userId: id,
                    isOnline: false
                });
                break;
            case "area":
                getAreaInfoAndShow({
                    areaId: id
                });
                break;
            case "attend":
                break;
        }
    }

    function getPageId(name){
        switch (name) {
            case "报警":
            case "报警图层":
                return 'c119';
            case "反馈图层":
                return 'feedback';
            case "轨迹":
            case "轨迹图层":
                return 'road';
            case "关键点图层":
                return 'pointer';
            case "热点":
            case "热点图层":
                return 'hot';
            case "护林员":
            case "护林员图层":
                return 'forester';
            case "巡护区":
            case "巡护区图层":
                return 'area';
            case "考勤":
                return 'attend';
            default:
                return '';
        }
    }
    /**
     * 切换到三维
     */
    function switch3D() {
        hlyMap.contMap.scene.set3dModel(true);
    }
    GIS$.switch3D = switch3D;

    /**
     * 切换到二维
     */
    function switch2D() {
        hlyMap.contMap.scene.set3dModel(false);
    }
    GIS$.switch2D = switch2D;

    /**
     * 跳转到单位区域
     */
    function jumpToUnitZone(points) {
        if(!points) return;
        hlyMapService.jumpToUnitZone(points);
    }
    GIS$.jumpToUnitZone = jumpToUnitZone;

    /**
     * 跳转到坐标点位
     */
    function gotoLocation() {
        hlyMap.gotoLocation(115, 24);
    }
    /*==============================业务模块接口=============================*/

    /**
     * 跳转到护林员
     */
    function jumpToHly(data) {
        hlyMapService.jumpToHly(data.UserId, data);
    }

    /**
     * 锁定（追踪）护林员
     */
    var trackingOnUser = false;
    function trackOnHly() {
        //定时查询用户位置，定位地图到当前位置
        trackingOnUser = !trackingOnUser;
        if (trackingOnUser) {
            hlyMapService.trackOnHly("89954a6c-85f7-4e57-b97a-fae8eed87f2c")
        } else {
            hlyMapService.unTrackOnHly()
        }
    }
    /**
     * 关闭当前护林员专题
     */
    function closeCurrentHly() {
        hlyMapService.closeCurrentHly();
    }

    /**
     * 打开轨迹专题
     */
    function startGjTheme(info) {
        console.log('打开轨迹专题', info);
        hlyMapService.showGj(null, null, info);
    }
    /**
     * 添加轨迹到护林员专题
     */
    function addGjToTheme(name, id, info) {
        console.log('添加轨迹到护林员专题', name, id, info);
        hlyMapService.showGj(name, id, info);
    }

    /**
     * 轨迹播放
     */
    function trackPlay(info) {
        hlyMapService.gjPlayInit(info);

        var value = 0;
        var step = 10;
        code = setInterval(function () {
            if (value > 100) {
                //停止循环
                clearInterval(code);
                hlyMapService.gjPlayClose();
            }
            hlyMapService.gjPlay(value / 100.0);
            value = value + step;
        }, 1000);
    }
    GIS$.trackPlay = trackPlay;
    /**
     * 关闭护林员专题
     */
    function closeCurrentGjTheme() {
        hlyMapService.closeCurrentGjTheme();
    }

    /**
     * 打开巡护区专题
     */
    function startXhqTheme(info) {
        console.log('打开巡护区专题', info);
        hlyMapService.showXhq(null, null, info);
    }

    /**
     * 添加巡护区到护林员专题
     */
    function addXhqToTheme(name, id, info) {
        console.log('添加巡护区到护林员专题', name, id, info);
        hlyMapService.showXhq(name, id, info);
    }
    /**
     * 关键点地图事件挂接
     */
    var keyPointPointermoveCallBack;
    function gjdMapOverEvent() {
        if (!keyPointPointermoveCallBack) {
            keyPointPointermoveCallBack = function (e) {
                if (e.pointerOn) {
                    var keyPointId = e.itemId;
                    $("#keyPointId").text("地图选中的关键点ID：" + keyPointId);
                } else {
                    $("#keyPointId").text("");
                }
            };
        }
        //关联页面显示
        hlyMapService.on("KeyPointPointermove", keyPointPointermoveCallBack);
    }

    /**
     * 选择关键点
     */
    function selectKeyPoint(info) {
        hlyMapService.selectKeyPoint(info);
    }

    /**
     * 取消选择关键点
     */
    function unSelectKeyPoint() {
        hlyMapService.unSelectKeyPoint();
    }

    /**
     * 取消关键点地图事件挂接
     */
    function cancelGjdMapOverEvent() {
        hlyMapService.un("KeyPointPointermove", keyPointPointermoveCallBack);
    }

    /**
     * 当搜索全省市的巡护区时触发
     */
    function onSearchAllXhqWithinProvinceAndCity() {
        hlyMapService.onSearchAllXhqWithinProvinceAndCity();
    }
    GIS$.onSearchAllXhqWithinProvinceAndCity = onSearchAllXhqWithinProvinceAndCity;

    /**
     * 当搜索全县的巡护区时触发
     */
    function onSearchAllXhqWithinCounty() {
        hlyMapService.onSearchAllXhqWithinCounty("阳山县");
    }
    GIS$.onSearchAllXhqWithinCounty = onSearchAllXhqWithinCounty;

    /**
     * 当搜索全乡镇的巡护区时触发
     */
    function onSearchAllXhqWithinTown(data, name) {
        hlyMapService.onSearchAllXhqWithinTown(data, name);
    }
    GIS$.onSearchAllXhqWithinTown = onSearchAllXhqWithinTown;

    /**
     * 清除巡护区的动态地图底图
     */
    function clearXhqBaseLayer() {
        hlyMapService.clearXhqBaseLayer();
    }

    /**
     * 关闭巡护区专题
     */
    function closeCurrentXhqTheme() {
        hlyMapService.closeCurrentXhqTheme();
    }

    /**
     * 打开报警专题
     */
    function startBjTheme(info) {
        hlyMapService.showBj(null, null, info);
    }

    /**
     * 添加轨迹到护林员专题
     */
    function addBjToTheme(name, id, info) {
        hlyMapService.showBj(name, id, info);
    }

    /**
     * 关闭报警专题
     */
    function closeCurrentBjTheme() {
        hlyMapService.closeCurrentBjTheme();
    }

    /**
     * 打开热点专题
     */
    function startRdTheme(info) {
        hlyMapService.showRd(null, null, info);
    }

    /**
     * 添加热点到护林员专题
     */
    function addRdToTheme(name, id, info) {
        hlyMapService.showRd(name, id, info);
    }

    /**
     * 关闭热点专题
     */
    function closeCurrentRdTheme() {
        hlyMapService.closeCurrentRdTheme();
    }

})();