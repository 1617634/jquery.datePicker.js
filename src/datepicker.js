$(function (window, $) {

  var helper = {
    // 浏览器可视宽高
    getWindowSize: function() {
      return {
        width: document.body.clientWidth,
        height: document.body.clientHeight,
      }
    },

    // 获取元素translate x y值
    getComputedTranslate: function(obj) {
      if(!window.getComputedStyle) return {x:0, y:0};
      var style = getComputedStyle(obj),
          transform = style.transform || style.webkitTransform || style.mozTransform;
      var mat = transform.match(/^matrix3d\((.+)\)$/);
      if(mat){
        return {
          x: parseFloat(mat[1].split(', ')[12]),
          y: parseFloat(mat[1].split(', ')[13])
        }
      }
      mat = transform.match(/^matrix\((.+)\)$/);
      if(mat){
        return {
          x: parseFloat(mat[1].split(', ')[4]),
          y: parseFloat(mat[1].split(', ')[5]),
        }
      }
      return {x:0, y:0};
    },

    // 获取元素距离浏览器顶部的距离
    getElementTop: function (elem){
      var elemTop = elem.offsetTop;
      var pElem = elem.offsetParent;
      while (pElem != null) {
        elemTop += pElem.offsetTop;
        if(pElem.style.transform){
          elemTop += this.getComputedTranslate(pElem).y
        }
        pElem = pElem.offsetParent;
      }
      return elemTop;
    },

    // 获取元素距离浏览器左侧的距离
    getElementLeft: function (elem){
      var elemLeft = elem.offsetLeft;
      var pElem = elem.offsetParent;
      while (pElem != null) {
        elemLeft += pElem.offsetLeft;
        if(pElem.style.transform){
          elemLeft += this.getComputedTranslate(pElem).x
        }
        pElem = pElem.offsetParent;
      }
      return elemLeft;
    },
    padZero: function(direction, str, num, pad){
      pad = pad? pad: '0';
      str = typeof str !== 'string'? str.toString(): str;
      if(!~['left', 'right'].indexOf(direction))return str;
      if(!num)return str
      if(str.length >= num)return str;
      var len = num - str.length;
      var padAll = ''
      for(var i= 0; i< len; i++){
        padAll += pad
      }

      return direction === 'left'? padAll+str: str+padAll;
    }
  }
  var dateUtil = {
    /**
     * 格式化时间
     * @param {string} format 
     * @param {string} timeStr
     */
     formatTime: function (format, timeStr){
      if(!this.checkTime(timeStr)) return '';

      var _timeStr = timeStr.replace(/[^\d]/g, '');
      var year = _timeStr.slice(0, 4)
      var month = _timeStr.slice(4, 6)
      var day = _timeStr.slice(-2)
      return format.replace(/YYYY/i, year).replace(/MM/i, month).replace(/DD/i, day)
    },

    // 判断是否是闰年
    checkRunYear: function(year){
      return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
    },

    /**
     * 校验时间是否合规
     * @param {string} timeStr 
     */
    checkTime: function(timeStr){
      if(typeof timeStr !== 'string')return false;
      var _timeStr = timeStr.replace(/[^\d]/g, '');
      if((_timeStr.length ^ 8) !== 0) return false;
      var year = +_timeStr.slice(0, 4)
      var month = +_timeStr.slice(4, 6)
      var day = +_timeStr.slice(-2)
      if(!month || month > 12)return false;
      if(!day)return false;
      
      if(~[1, 3, 5, 7, 8, 10, 12].indexOf(month)){
        return day <= 31
      }else if(~[4, 6, 9, 11].indexOf(month)){
        return day <= 30
      }else{
        var isRunYear = this.checkRunYear(year)
        return isRunYear? day <= 29: day <= 28
      }
    },
    today: function(){
      var now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      }
    },
    getWeek: function(timeStr){
      var week = new Date(this.formatTime('YYYY-MM-DD', timeStr)).getDay();
      return week || 7;
    },
    /**
     * 获取当前月份总共有多少天
     * @param {string} timeStr 格式 YYYYMMDD
     */
    getMonthDays: function(timeStr){
      var year = +timeStr.slice(0, 4)
      var month = +timeStr.slice(4, 6)

      if(~[1, 3, 5, 7, 8, 10, 12].indexOf(month)){
        return 31
      }else if(~[4, 6, 9, 11].indexOf(month)){
        return 30
      }else{
        var isRunYear = this.checkRunYear(year)
        return isRunYear? 29: 28
      }
    },
    /**
     * 上一个月最后一天是几号
     * @param {string} timeStr 格式 YYYYMMDD
     */
    lastMonthDay: function(timeStr){
      var prev = this.getPrevMonth(timeStr)

      return this.getMonthDays(prev.year + helper.padZero('left', prev.month, 2, '0') + '01')
    },

    /**
     * 上一个月 是几月 哪一年
     * @param {string} timeStr 格式 YYYYMMDD
     */
    getPrevMonth: function(timeStr){
      var now = new Date(this.formatTime('YYYY-MM-DD', timeStr))
      now.setMonth(now.getMonth()-1);
      var year = now.getFullYear();
      var month = now.getMonth() + 1;
      return {
        year: year,
        month: month
      }
    },

    /**
     * 当前 是几月 哪一年
     * @param {string} timeStr 格式 YYYYMMDD
     */
    getCurMonth: function(timeStr){
      var now = new Date(this.formatTime('YYYY-MM-DD', timeStr))
      var year = now.getFullYear();
      var month = now.getMonth() + 1;
      return {
        year: year,
        month: month
      }
    },
    /**
     * 下一个月 是几月 哪一年
     * @param {string} timeStr 格式 YYYYMMDD
     */
    getNextMonth: function(timeStr){
      var now = new Date(this.formatTime('YYYY-MM-DD', timeStr))
      now.setMonth(now.getMonth()+1);
      var year = now.getFullYear();
      var month = now.getMonth() + 1;
      return {
        year: year,
        month: month
      }
    }
  }

  // 日期选择器
  function DatePicker(options) {
    this.options = {
      container: null,// 容器
      format: 'YYYY-MM-DD',// 展示格式
      inputFormat: 'YYYYMMDD',// 输出格式
      value: '',// 默认值
      width: '',// 宽度
      disabled: false,// 是否禁用
      change: function(){},
    }

    this.options = $.extend({}, this.options, options);
    this.value = dateUtil.formatTime('YYYYMMDD', this.options.value || '')
    this.calendar = null;
    this.weekText = ['日', '一', '二', '三', '四', '五', '六'];
    this.datePickerWidth = 245;
    this.init();
  }

  DatePicker.prototype = {
    init: function () { // 初始化
      this.initElement(); // 初始化元素
      this.bindEvent();   // 绑定事件
    },
    renderCalendarIcon: function(){
      return `<span class="ww-picker-suffix"><span role="img" aria-label="calendar" class="anticon">
      <svg viewBox="64 64 896 896" focusable="false" data-icon="calendar" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"></path></svg>
      </span></span>`
    },
    renderCloseIcon: function(){
      return`<span class="ww-picker-clear" role="button"><span role="img" aria-label="close-circle" class="anticon">
      <svg viewBox="64 64 896 896" focusable="false" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path></svg>
      </span></span>`
    },
    initElement: function () { // 初始化元素
      this.options.container.addClass('ww-datepicker-hidden-accessible')
      var style = ''
      if(/^\d+$/.test(this.options.width)){
        style = 'width: '+ this.options.width + 'px;';
      }
      this.options.container.after(`<div class="ww-picker" style="${style}">
        <div class="ww-picker-input">
          <input placeholder="请选择日期" size="12" autocomplete="off" value="${dateUtil.formatTime(this.options.format, this.value)}">
          ${this.renderCalendarIcon()}
          ${this.value? this.renderCloseIcon(): ''}
        </div>
      </div>`)

      this.inputElement = this.options.container.next();
    },

    renderCalendarHeader(date){
      return `
        <div class="ww-picker-header" data-year="${date.year}" data-month="${date.month}">
          <button type="button" tabindex="-1" class="ww-picker-operator ww-picker-header-super-prev-btn" operator="-" unit="year">
            <span class="ww-picker-super-prev-icon"></span>
          </button>
          <button type="button" tabindex="-1" class="ww-picker-operator ww-picker-header-prev-btn" operator="-" unit="month">
            <span class="ww-picker-prev-icon"></span>
          </button>
          <div class="ww-picker-header-view">
            <button type="button" tabindex="-1" class="ww-picker-year-btn">${date.year}年</button>
            <button type="button" tabindex="-1" class="ww-picker-month-btn">${date.month}月</button>
          </div>
          <button type="button" tabindex="-1" class="ww-picker-operator ww-picker-header-next-btn" operator="+" unit="month">
            <span class="ww-picker-next-icon"></span>
          </button>
          <button type="button" tabindex="-1" class="ww-picker-operator ww-picker-header-super-next-btn" operator="+" unit="year">
            <span class="ww-picker-super-next-icon"></span>
          </button>
        </div>
      `
    },
    // 两位补0
    pad: function(text){
      return helper.padZero('left', text, 2, '0')
    },
    renderCalendarBody(date, previewDate){
      var _previewDate = previewDate.year + ''+ this.pad(previewDate.month) + '01'
      var curMonthFirstWeek = dateUtil.getWeek(_previewDate);// 当前月1号是周几
      var curMonthDays = dateUtil.getMonthDays(_previewDate);// 当前月有多少天
      var prevMonthLastDay = dateUtil.lastMonthDay(_previewDate);// 上一个月最后一天是几号

      var prevMonth = dateUtil.getPrevMonth(_previewDate);
      var nextMonth = dateUtil.getNextMonth(_previewDate);

      var todayTime = dateUtil.today();
      var isToday = todayTime.year === previewDate.year && todayTime.month === previewDate.month;
      var isCur = date.year === previewDate.year && date.month === previewDate.month;
      

      var dayList = [];
      for(var i =1; i<= 42; i++){
        var index = ~~((i-1)/7);
        if(!dayList[index]){
          dayList[index] = [];
        }

        var day = '', text = '', curMonth = false, today = false, sel = false, isLast = false, isFirst = false;
        if(i < curMonthFirstWeek){// 补上个月
          text = prevMonthLastDay - (curMonthFirstWeek - i) + 1;
          isLast = prevMonthLastDay === text;
          day = prevMonth.year + this.pad(prevMonth.month) + this.pad(text);
        }else{
          if(i >= curMonthFirstWeek + curMonthDays){// 补下个月
            text = i - (curMonthFirstWeek + curMonthDays) + 1;
            isFirst = text === 1;
            day = nextMonth.year + this.pad(nextMonth.month) + this.pad(text);
          }else{
            text = i - curMonthFirstWeek + 1
            isFirst = text === 1;
            isLast = text === curMonthDays;
            day = previewDate.year +''+ this.pad(previewDate.month) +''+ this.pad(text);
            curMonth = true;
            today = isToday && text === todayTime.day;
            sel = isCur && text === date.day
          }
        }

        dayList[index].push({
          day: day,// 2050-01-01
          text: text,// 页面展示的 “号” 数字
          curMonth: curMonth,// 是否是当前月
          today: today,// 是否是今天
          sel: sel,// 是否选中
          isLast: isLast,// 最后一天
          isFirst: isFirst,// 第一天
        })
      }

      return `
        <div class="ww-picker-body">
          <table class="ww-picker-content">
            <thead><tr><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th><th>日</th></tr></thead>
            <tbody>
            ${dayList.map(function(v){
              var html = "<tr>";
              html = v.map(function(cell){
                var classText = "ww-picker-cell";
                if(cell.isFirst){
                  classText += " ww-picker-cell-start"
                }
                if(cell.isLast){
                  classText += " ww-picker-cell-end"
                }
                if(cell.curMonth){
                  classText += " ww-picker-cell-in-view"
                }
                if(cell.today){
                  classText += " ww-picker-cell-today"
                }

                if(cell.sel){
                  classText += " ww-picker-cell-selected"
                }
                return `
                <td title="${cell.day}" class="${classText}"><div class="ww-picker-cell-inner">${cell.text}</div></td>
                `
              }).join('')
              html += '</tr>'
              return html;
            }).join('')}
            </tbody>
          </table>
        </div>
      `
    },

    renderCalendarContent: function(dateStr, previewDate){

      var date = {year: '', month: '', day: '', week: ''}
      if(dateStr){
        date = {
          year: +dateStr.slice(0, 4),
          month: +dateStr.slice(4, 6),
          day: +dateStr.slice(-2),
          week: dateUtil.getWeek(dateStr)
        }
      }
      if(!previewDate){
        if(dateStr){
          previewDate = {
            year: date.year,
            month: date.month
          }
        }else{
          var today = dateUtil.today();
          previewDate = {
            year: today.year,
            month: today.month
          }
        }
      }

      return `
      ${this.renderCalendarHeader(previewDate)}
      ${this.renderCalendarBody(date, previewDate)}
      `
    },
    renderCalendar: function(pos){

      if(!this.calendar){
        this.calendar = $('<div style="position: absolute; top: 0px; left: 0px; width: 100%;"></div>')
        $('body').append(this.calendar)
        this.calendar.html(`<div>
          <div class="ww-picker-dropdown" style="left: ${pos.x}px; top: ${pos.y}px;">
            <div class="ww-picker-panel-container">
            <div class="ww-picker-panel">
                <div class="ww-picker-date-panel"></div>
                <div class="ww-picker-footer">
                  <a class="ww-picker-today-btn">今天</a>
                </div>
              </div>
            </div>
          </div>
        </div>`)
        this.bindCalendarEvent()// 绑定弹框 元素事件
      }else{
        this.showCalendar()
      }

      this.calendar.find('.ww-picker-date-panel').html(this.renderCalendarContent(this.value))
    },

    hasShowCalendar: function(){
      return !this.calendar.find('.ww-picker-dropdown').hasClass('ww-picker-dropdown-hidden')
    },
    showCalendar: function(){
      this.calendar && this.calendar.find('.ww-picker-dropdown').removeClass('ww-picker-dropdown-hidden')
    },
    hideCalendar: function(){
      this.calendar && this.calendar.find('.ww-picker-dropdown').addClass('ww-picker-dropdown-hidden')
    },

    setInputVal: function(value){
      this.inputElement.find('input').val(value)
    },
    onchange: function(value){
      this.value = value
      this.setInputVal(dateUtil.formatTime(this.options.format, value));
      var val = dateUtil.formatTime(this.options.inputFormat, value);
      var that = this.options.container.get(0)
      that.value = val;
      this.options.change.call(that, val)

      if(value){
        this.inputElement.find('.ww-picker-suffix').after(this.renderCloseIcon())
      }else{
        this.inputElement.find('.ww-picker-clear').remove()
      }
    },
    bindEvent: function(){ // 绑定事件
      this.globalEvent()
      this.bindInputEvent()// 绑定input 元素事件
    },
    globalEvent: function(){
      var that = this;
      $(document).bind("click", function(e){
        var bingo = true;
        var curElement = e.target;

        while (curElement != null) {
          if(curElement === that.inputElement.get(0) || (that.calendar && curElement === that.calendar.get(0))){
            bingo = false;
            curElement = null
          }else{
            curElement = curElement.parentNode;
          }
        }
        if(bingo){
          that.inputElement && that.inputElement.removeClass('ww-picker-focused')
          that.hideCalendar()
        }
      })
    },
    bindInputEvent: function(){
      var that = this;
      this.inputElement.find('input').focus(function(){
        that.inputElement.addClass('ww-picker-focused')
        if(that.calendar && that.hasShowCalendar())return false;

        var y = helper.getElementTop(that.inputElement.get(0))
        var x = helper.getElementLeft(that.inputElement.get(0))

        var winWidth = helper.getWindowSize().width;
        if(winWidth - x < that.datePickerWidth){// 默认左边对齐，如果右边距离不够则右边对齐
          var inputWidth = that.inputElement.width();
          if(inputWidth < that.datePickerWidth){
            x = x - (that.datePickerWidth - inputWidth);
          }
        }
        x = x<0? 0: x;

        that.renderCalendar({
          x: x, 
          y: y + that.inputElement.height()// 这个5px是故意留的间距
        })
      })

      this.inputElement.find('input').bind('input', function(e){
        var val = e.target.value || ''
        if(dateUtil.checkTime(val)){
          val = dateUtil.formatTime('YYYYMMDD', val);
          e.target.value = dateUtil.formatTime(that.options.format, val);
          that.calendar.find('.ww-picker-date-panel').html(that.renderCalendarContent(val))
        }
      })

      this.inputElement.find('input').blur(function(e){
        var val = e.target.value || ''
        if(dateUtil.checkTime(val)){
          val = dateUtil.formatTime('YYYYMMDD', val);
          val !== that.value && that.onchange(val)
        }else{
          e.target.value = dateUtil.formatTime(that.options.format, that.value);
        }
      })

      this.inputElement.delegate('.ww-picker-clear', 'click', function(){
        that.onchange('')
      })
    },
    bindCalendarEvent: function(){
      var that = this;
      this.calendar.delegate('.ww-picker-cell', 'click', function(){
        that.calendar.find('.ww-picker-cell-selected').removeClass('ww-picker-cell-selected');
        $(this).addClass('ww-picker-cell-selected')
        var date = $(this).attr('title');
        that.onchange(date)
        that.hideCalendar()
      })


      this.calendar.delegate('.ww-picker-operator', 'click', function(e){
        e.stopPropagation && e.stopPropagation()
        var operator = $(this).attr('operator')
        var unit = $(this).attr('unit')
        var year = +$(this).parent().attr('data-year');
        var month = +$(this).parent().attr('data-month');

        if(operator === '-'){
          if(unit === 'year'){
            year--;
          }else{
            if(--month <= 0){
              month = 12, year--;
            }
          }
        }else{
          if(unit === 'year'){
            year++;
          }else{
            if(++month > 12){
              month = 1, year++;
            }
          }
        }

        that.calendar.find('.ww-picker-date-panel').html(that.renderCalendarContent(that.value, {
          year: year,
          month: month
        }))
      })

      this.calendar.delegate('.ww-picker-today-btn', 'click', function(){
        var today = dateUtil.today();
        that.onchange(today.year + '' + that.pad(today.month) + '' + that.pad(today.day))
        that.hideCalendar()
      })

      
    }
  }
  // 日期范围选择器
  function RangePicker(options) {
    this.options = {
      container: null,// 容器
      format: 'YYYY-MM-DD',// 展示格式
      inputFormat: 'YYYYMMDD',// 输出格式
      value: [],// 默认值
      width: '',// 宽度
      disabled: false,// 是否禁用
      change: function(){},
    }

    this.options = $.extend({}, this.options, options);
    var value = this.options.value;

    if(value.filter(function(time){ return dateUtil.checkTime(time)}).length === 2){
      this.value = value.map(function(time){
        return dateUtil.formatTime('YYYYMMDD', time)
      })
    }else{
      this.value = []// 当前选中的日期 格式：[YYYYMMDD, YYYYMMDD]
    }
    this.displayValue = this.setDisplayValue(this.value),// 日历显示月份用的 格式：[{year: number, month: number}, {year: number, month: number}]
    this.calendar = null;
    this.weekText = ['日', '一', '二', '三', '四', '五', '六'];
    this.rangePickerWidth = 488;
    this.init();
  }

  RangePicker.prototype = {
    init: function () { // 初始化
      this.initElement(); // 初始化元素
      this.bindEvent();   // 绑定事件
    },
    renderCalendarIcon: function(){
      return `<span class="ww-picker-suffix"><span role="img" aria-label="calendar" class="anticon">
      <svg viewBox="64 64 896 896" focusable="false" data-icon="calendar" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"></path></svg>
      </span></span>`
    },
    renderCloseIcon: function(){
      return`<span class="ww-picker-clear" role="button"><span role="img" aria-label="close-circle" class="anticon">
      <svg viewBox="64 64 896 896" focusable="false" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path></svg>
      </span></span>`
    },
    renderToIcon: function(){
      return `<span aria-label="to" class="ww-picker-separator"><span role="img" aria-label="swap-right" class="anticon anticon-swap-right">
      <svg viewBox="0 0 1024 1024" focusable="false" data-icon="swap-right" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M873.1 596.2l-164-208A32 32 0 00684 376h-64.8c-6.7 0-10.4 7.7-6.3 13l144.3 183H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h695.9c26.8 0 41.7-30.8 25.2-51.8z"></path></svg>
      </span></span>`
    },
    initElement: function () { // 初始化元素
      this.options.container.addClass('ww-datepicker-hidden-accessible')
      var style = ''
      if(/^\d+$/.test(this.options.width)){
        style = 'width: '+ this.options.width + 'px;';
      }

      var flag = this.value.filter(function(time){ return dateUtil.checkTime(time)}).length === 2;
      this.options.container.after(`<div class="ww-picker ww-picker-range" style="${style}">
        <div class="ww-picker-input">
          <input placeholder="开始日期" size="12" autocomplete="off" value="${flag? dateUtil.formatTime(this.options.format, this.value[0]): ''}">
        </div>
        <div class="ww-picker-range-separator">${this.renderToIcon()}</div>
        <div class="ww-picker-input">
          <input placeholder="结束日期" size="12" autocomplete="off" value="${flag? dateUtil.formatTime(this.options.format, this.value[1]): ''}">
        </div>
        ${this.renderCalendarIcon()}
        ${flag? this.renderCloseIcon(): ''}
      </div>`)
  
      this.inputElement = this.options.container.next();
    },
    // 两位补0
    pad: function(text, num){
      num = num || 2;
      return helper.padZero('left', text, num, '0')
    },
    setDisplayValue: function(value){
      let displayValue = [];

      if(value.length === 2){
        if(value[0].slice(0, 4) === value[1].slice(0, 4)){
          var nextMonth = dateUtil.getNextMonth(value[0])
          displayValue = [{
            year: +value[0].slice(0, 4),
            month: +value[0].slice(4, 6),
          }, nextMonth]
        }else{
          displayValue = value.map(function(v){return +v}).sort().map(function(v){
            var val = v.toString()
            return {
              year: +val.slice(0, 4),
              month: +val.slice(4, 6)
            }
          })
        }
      }else{
        var curMonth = dateUtil.today();
        var nextMonth = dateUtil.getNextMonth(this.pad(curMonth.year, 4)+this.pad(curMonth.month)+'01')
        displayValue = [curMonth, nextMonth]
      }

      return displayValue
    },
    renderCalendarHeader(position, dates){
      var date = position === 'left'? dates[0]: dates[1];
      var otherDate = position === 'left'? dates[1]: dates[0];
      var disabledCutYaerBtn = false, disabledCutMonthBtn = false, disabledAddYaerBtn = false, disabledAddMonthBtn = false;

      if(position === 'left'){
        if(date.month >= otherDate.month && date.year >= otherDate.year - 1){
          disabledAddYaerBtn = true
        }

        if(date.month < otherDate.month && date.year >= otherDate.year){
          disabledAddYaerBtn = true
        }

        if(date.year === otherDate.year && date.month >= otherDate.month - 1){
          disabledAddMonthBtn = true
        }
        if(date.year === otherDate.year-1 && date.month === 12 && otherDate.month === 1){
          disabledAddMonthBtn = true
        }
      }else{
        if(date.month > otherDate.month && date.year <= otherDate.year){
          disabledCutYaerBtn = true
        }

        if(date.month <= otherDate.month && date.year <= otherDate.year+1){
          disabledCutYaerBtn = true
        }

        if(date.year === otherDate.year && date.month <= otherDate.month + 1){
          disabledCutMonthBtn = true
        }
        if(date.year === otherDate.year+1 && date.month === 1 && otherDate.month === 12){
          disabledCutMonthBtn = true
        }
      }

      return `
        <div class="ww-picker-header" data-position="${position}">
          <button type="button" tabindex="-1" ${disabledCutYaerBtn?'disabled':''} class="ww-picker-operator ww-picker-header-super-prev-btn" operator="-" unit="year">
            <span class="ww-picker-super-prev-icon"></span>
          </button>
          <button type="button" tabindex="-1" ${disabledCutMonthBtn?'disabled':''} class="ww-picker-operator ww-picker-header-prev-btn" operator="-" unit="month">
            <span class="ww-picker-prev-icon"></span>
          </button>
          <div class="ww-picker-header-view">
            <button type="button" tabindex="-1" class="ww-picker-year-btn">${date.year}年</button>
            <button type="button" tabindex="-1" class="ww-picker-month-btn">${date.month}月</button>
          </div>
          <button type="button" tabindex="-1" ${disabledAddMonthBtn?'disabled':''} class="ww-picker-operator ww-picker-header-next-btn" operator="+" unit="month">
            <span class="ww-picker-next-icon"></span>
          </button>
          <button type="button" tabindex="-1" ${disabledAddYaerBtn?'disabled':''} class="ww-picker-operator ww-picker-header-super-next-btn" operator="+" unit="year">
            <span class="ww-picker-super-next-icon"></span>
          </button>
        </div>
      `
    },
    
    renderCalendarBody(position, date, previewDates){
      var previewDate = position === 'left'? previewDates[0]: previewDates[1];
      var _previewDate = previewDate.year + ''+ this.pad(previewDate.month) + '01'

      var curMonthFirstWeek = dateUtil.getWeek(_previewDate);// 当前月1号是周几
      var curMonthDays = dateUtil.getMonthDays(_previewDate);// 当前月有多少天
      var prevMonthLastDay = dateUtil.lastMonthDay(_previewDate);// 上一个月最后一天是几号

      var prevMonth = dateUtil.getPrevMonth(_previewDate);
      var nextMonth = dateUtil.getNextMonth(_previewDate);

      var todayTime = dateUtil.today();
      var isToday = todayTime.year === previewDate.year && todayTime.month === previewDate.month;

      var dayList = [];
      for(var i =1; i<= 42; i++){
        var index = ~~((i-1)/7);
        if(!dayList[index]){
          dayList[index] = [];
        }

        var day = '', text = '', curMonth = false, today = false, sel = false, isLast = false, isFirst = false, isInRange = false, isStart = false, isEnd = false;
        if(i < curMonthFirstWeek){// 补上个月
          text = prevMonthLastDay - (curMonthFirstWeek - i) + 1;
          isLast = prevMonthLastDay === text;
          day = prevMonth.year + this.pad(prevMonth.month) + this.pad(text);
        }else{
          if(i >= curMonthFirstWeek + curMonthDays){// 补下个月
            text = i - (curMonthFirstWeek + curMonthDays) + 1;
            isFirst = text === 1;
            day = nextMonth.year + this.pad(nextMonth.month) + this.pad(text);
          }else{
            text = i - curMonthFirstWeek + 1
            isFirst = text === 1;
            isLast = text === curMonthDays;
            day = previewDate.year +''+ this.pad(previewDate.month) +''+ this.pad(text);
            curMonth = true;
            today = isToday && text === todayTime.day;

            isStart = date[0] === day;
            isEnd = date[1] === day;
            if(date[0] && date[1]){
              isInRange = +day > +date[0] && +day < +date[1]
            }
          }
        }

        dayList[index].push({
          day: day,// 20500101
          text: text,// 页面展示的 “号” 数字
          curMonth: curMonth,// 是否是当前月
          today: today,// 是否是今天
          isLast: isLast,// 最后一天
          isFirst: isFirst,// 第一天
          isInRange: isInRange,// 是否在选中范围内
          isStart: isStart,// 是否是选中的开始
          isEnd: isEnd,// 是否是选中的结束
        })
      }

      return `
        <div class="ww-picker-body">
          <table class="ww-picker-content">
            <thead><tr><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th><th>日</th></tr></thead>
            <tbody>
            ${dayList.map(function(v){
              var html = "<tr>";
              html = v.map(function(cell){
                var classText = "ww-picker-cell";
                if(cell.isFirst){
                  classText += " ww-picker-cell-start"
                }
                if(cell.isLast){
                  classText += " ww-picker-cell-end"
                }
                if(cell.curMonth){
                  classText += " ww-picker-cell-in-view"
                }
                if(cell.today){
                  classText += " ww-picker-cell-today"
                }

                if(cell.isInRange){
                  classText += " ww-picker-cell-in-range"
                }
                if(cell.isStart){
                  classText += " ww-picker-cell-range-start"
                }
                if(cell.isEnd){
                  classText += " ww-picker-cell-range-end"
                }
                return `
                <td title="${cell.day}" class="${classText}"><div class="ww-picker-cell-inner">${cell.text}</div></td>
                `
              }).join('')
              html += '</tr>'
              return html;
            }).join('')}
            </tbody>
          </table>
        </div>
      `
    },
    renderCalendarContent: function(position, date, previewDate){
      return `
      ${this.renderCalendarHeader(position, previewDate)}
      ${this.renderCalendarBody(position, date, previewDate)}
      `
    },
    renderCalendar: function(pos){

      if(!this.calendar){
        this.calendar = $('<div style="position: absolute; top: 0px; left: 0px; width: 100%;"></div>')
        $('body').append(this.calendar)
        this.calendar.html(`<div>
          <div class="ww-picker-dropdown ww-picker-dropdown-range" style="left: ${pos.x}px; top: ${pos.y}px;">
            <div class="ww-picker-panel-container">
              <div class="ww-picker-panels">
                <div tabindex="-1" class="ww-picker-panel">
                  <div class="ww-picker-date-panel ww-picker-left"></div>
                </div>
                <div tabindex="-1" class="ww-picker-panel">
                  <div class="ww-picker-date-panel ww-picker-right"></div>
                </div>
              </div>
            </div>
          </div>
        </div>`)
        this.bindCalendarEvent()// 绑定弹框 元素事件
      }else{
        this.showCalendar()
      }

      this.calendar.find('.ww-picker-date-panel.ww-picker-left').html(this.renderCalendarContent('left', this.value, this.displayValue))
      this.calendar.find('.ww-picker-date-panel.ww-picker-right').html(this.renderCalendarContent('right', this.value, this.displayValue))
    },

    hasShowCalendar: function(){
      return !this.calendar.find('.ww-picker-dropdown').hasClass('ww-picker-dropdown-hidden')
    },
    showCalendar: function(){
      this.calendar && this.calendar.find('.ww-picker-dropdown').removeClass('ww-picker-dropdown-hidden')
    },
    hideCalendar: function(){
      this.calendar && this.calendar.find('.ww-picker-dropdown').addClass('ww-picker-dropdown-hidden')
    },

    setInputVal: function(value){
      if(value.length === 2){
        this.inputElement.find('input').eq(0).val(value[0])
        this.inputElement.find('input').eq(1).val(value[1])
      }
    },
    onchange: function(value){
      if(value.length === 1){
        value = []
      }
      var that = this;
      this.value = value;
      this.setInputVal(this.value.map(function(v){
        return dateUtil.formatTime(that.options.format, v)
      }));
      var val = this.value.map(function(v){
        return dateUtil.formatTime(that.options.inputFormat, v)
      }) 
      var realElement = this.options.container.get(0)
      realElement.value = val.join(',');
      this.options.change.call(realElement, val)
      if(value.length === 2){
        this.inputElement.find('.ww-picker-suffix').after(this.renderCloseIcon())
      }else{
        this.inputElement.find('.ww-picker-clear').remove()
      }
    },
    bindEvent: function(){ // 绑定事件
      this.globalEvent()
      this.bindInputEvent()// 绑定input 元素事件
    },
    globalEvent: function(){
      var that = this;
      $(document).bind("click", function(e){
        var bingo = true;
        var curElement = e.target;

        while (curElement != null) {
          if(curElement === that.inputElement.get(0) || (that.calendar && curElement === that.calendar.get(0))){
            bingo = false;
            curElement = null
          }else{
            curElement = curElement.parentNode;
          }
        }
        if(bingo){
          that.inputElement && that.inputElement.removeClass('ww-picker-focused')
          that.hideCalendar()
        }
      })
    },
    bindInputEvent: function(){
      var that = this;
      this.inputElement.find('input').focus(function(){
        that.inputElement.addClass('ww-picker-focused')
        if(that.calendar && that.hasShowCalendar())return false;

        var y = helper.getElementTop(that.inputElement.get(0))
        var x = helper.getElementLeft(that.inputElement.get(0))

        var winWidth = helper.getWindowSize().width;
        if(winWidth - x < that.rangePickerWidth){// 默认左边对齐，如果右边距离不够则右边对齐
          var inputWidth = that.inputElement.width();
          if(inputWidth < that.rangePickerWidth){
            x = x - (that.rangePickerWidth - inputWidth);
          }
        }
        x = x<0? 0: x;

        that.renderCalendar({
          x: x, 
          y: y + that.inputElement.height()// 这个5px是故意留的间距
        })
      })

      this.inputElement.find('input').bind('input', function(e){
        // var val = e.target.value || ''
        // if(dateUtil.checkTime(val)){
        //   val = dateUtil.formatTime('YYYYMMDD', val);
        //   e.target.value = dateUtil.formatTime(that.options.format, val);
        //   that.calendar.find('.ww-picker-date-panel').html(that.renderCalendarContent(val))
        // }
      })

      this.inputElement.find('input').blur(function(e){
        // var val = e.target.value || ''
        // if(dateUtil.checkTime(val)){
        //   val = dateUtil.formatTime('YYYYMMDD', val);
        //   val !== that.value && that.onchange(val)
        // }else{
        //   e.target.value = dateUtil.formatTime(that.options.format, that.value);
        // }
      })

      this.inputElement.delegate('.ww-picker-clear', 'click', function(){
        // that.onchange('')
      })
    },
    bindCalendarEvent: function(){
      var that = this;
      this.calendar.delegate('.ww-picker-cell', 'click', function(){
        var date = $(this).attr('title');

        if(that.value.length === 0){
          $(this).addClass('ww-picker-cell-range-start').addClass('ww-picker-cell-range-start-single')
          that.value = [date]
        }else if(that.value.length === 1){
          var val = that.value[0];
          var newValue = []
          if(+val >= +date){
            newValue = [date, val]
          }else{
            newValue = [val, date]
          }
          that.onchange(newValue)
          that.hideCalendar()
        }else {
          that.calendar.find('.ww-picker-cell').removeClass('ww-picker-cell-range-start')
          .removeClass('ww-picker-cell-range-start-single')
          .removeClass('ww-picker-cell-in-range')
          .removeClass('ww-picker-cell-range-end')

          $(this).addClass('ww-picker-cell-range-start').addClass('ww-picker-cell-range-start-single')
          that.value = [date]
        }
      })

      this.calendar.delegate('.ww-picker-cell', 'mouseenter', function(){
        if(that.value.length === 1){
          
          that.calendar.find('.ww-picker-cell').removeClass('ww-picker-cell-range-hover')
          .removeClass('ww-picker-cell-range-hover-start')
          .removeClass('ww-picker-cell-range-hover-end')
          .removeClass('ww-picker-cell-range-hover-edge-end')
          .removeClass('ww-picker-cell-range-hover-edge-start')
          
          
          var lastValue = +(that.value[0] || that.value[1]);
          var val = +$(this).attr('title')

          var rang = []
          if(lastValue >= val){
            rang = [val, lastValue]
          }else{
            rang = [lastValue, val]
          }

          that.calendar.find('.ww-picker-cell').each(function(){
            var curVal = +$(this).attr('title')
            if(curVal === rang[0]){
              $(this).addClass('ww-picker-cell-range-hover-start')
            }else if(curVal === rang[1]){
              $(this).addClass('ww-picker-cell-range-hover-end')
              if($(this).hasClass('ww-picker-cell-start')){
                $(this).addClass('ww-picker-cell-range-hover-edge-start')
              }
            }else if(curVal > rang[0] && curVal < rang[1]){
              $(this).addClass('ww-picker-cell-range-hover')
              if($(this).hasClass('ww-picker-cell-end')){
                $(this).addClass('ww-picker-cell-range-hover-edge-end')
              }
              if($(this).hasClass('ww-picker-cell-start')){
                $(this).addClass('ww-picker-cell-range-hover-edge-start')
              }
            }
          })
        }
      })

      this.calendar.delegate('.ww-picker-operator', 'click', function(e){
        e.stopPropagation && e.stopPropagation()

        var position = $(this).parent().attr('data-position');
        var operator = $(this).attr('operator')
        var unit = $(this).attr('unit')

        var cur = position === 'left'? that.displayValue[0]: that.displayValue[1];
        var year = cur.year;
        var month = cur.month;


        if(operator === '-'){
          if(unit === 'year'){
            year--;
          }else{
            if(--month <= 0){
              month = 12, year--;
            }
          }
        }else{
          if(unit === 'year'){
            year++;
          }else{
            if(++month > 12){
              month = 1, year++;
            }
          }
        }

        var newVal = {
          year: year,
          month: month
        }

        var displayValue = []
        if(position === 'left'){
          displayValue = [newVal, that.displayValue[1]]
        }else{
          displayValue = [that.displayValue[0], newVal]
        }
        
        that.displayValue = displayValue
        that.calendar.find(`.ww-picker-date-panel.ww-picker-${position}`).html(that.renderCalendarContent(position, that.value, displayValue))

        var ohterPosition = position === 'left'? 'right': 'left';
        that.calendar.find(`.ww-picker-date-panel.ww-picker-${ohterPosition}`).html(that.renderCalendarContent(ohterPosition, that.value, displayValue))
      })
    }
  }

  $.fn.extend({
      datePicker: function (options) {
        this.each(function(){
          var opt = {}
          var that = $(this);

          opt.value = that.attr('value') || options.value;
          opt.format = that.attr('format') || options.format;
          opt.inputFormat = that.attr('inputFormat') || options.inputFormat;
          opt.width = that.attr('width') || options.width;
          opt.disabled = that.attr('disabled') === 'disabled'? true : options.disabled;
          opt.change = options.change;
          opt.container = that;
          new DatePicker(opt);
        })
      },
      rangePicker: function(options){
        this.each(function(){
          var opt = {}
          var that = $(this);

          var value = that.attr('value') || options.value || [];
          value = typeof value === 'string'? value.split(','): value;
          value = Object.prototype.toString.call(value) === '[object Array]'? value: [];

          opt.value = value;
          opt.format = that.attr('format') || options.format;
          opt.inputFormat = that.attr('inputFormat') || options.inputFormat;
          opt.width = that.attr('width') || options.width;
          opt.disabled = that.attr('disabled') === 'disabled'? true : options.disabled;
          opt.change = options.change;
          opt.container = that;
          new RangePicker(opt);
        })
      }
  });

}(window, jQuery));