interface EventInfo {
    title: string
};

interface ResultInterface {
    info: string,
    warn: string,
}

function doGet(e: any) {
    const template = HtmlService.createTemplateFromFile('index');
    template.activeUser = Session.getActiveUser();
    return template.evaluate().setTitle("テニス予定追加").addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

const eventSearchFilter = { search: 'テニス' };
const getCalendar = () => CalendarApp.getDefaultCalendar();

function getRecentEvents(): GoogleAppsScript.Calendar.CalendarEvent[] {
    var today = new Date();
    var todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    var searchStartDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    var events = getCalendar().getEvents(searchStartDate, todayEnd, eventSearchFilter);
    return filterAndSortEvents(events);
}

function getTodayTennisEvents(): GoogleAppsScript.Calendar.CalendarEvent[] {
    var date = new Date();
    var events = getCalendar().getEventsForDay(date, eventSearchFilter);
    return filterAndSortEvents(events);
}

const filterAndSortEvents = (events: GoogleAppsScript.Calendar.CalendarEvent[]) =>
    events.filter((event) => getTennisNumber(event) > 0)
        .sort((a, b) => getTennisNumber(a) - getTennisNumber(b))

const calEventToEventInfo = (event: GoogleAppsScript.Calendar.CalendarEvent): EventInfo => ({ title: event.getTitle() });

const getTodayTennisEventsInfo = () => getTodayTennisEvents().map(calEventToEventInfo);

function removeLastTodayTennis(): EventInfo {
    const events = getTodayTennisEvents();
    if (events.length === 0) {
        return { title: "" }
    }
    const event = events.slice().reverse()[0];
    const ret = calEventToEventInfo(event);
    event.deleteEvent();
    return ret;
}

const fullWidth2HalfWidth = (src: string) => src.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

function getTennisNumber(event: GoogleAppsScript.Calendar.CalendarEvent): number {
    var title = event.getTitle();
    if (fullWidth2HalfWidth(title).match(/^テニス\s*(\d+)$/)) {
        var n = parseInt(RegExp.$1);
        return n;
    }
    return 0;
}

function addTennis(): ResultInterface {
    var events = getRecentEvents();

    // 直近のテニスXXを取得
    var num = 0;
    if (events.length > 0) {
        const event = events.slice().reverse()[0];
        num = getTennisNumber(event);
    }
    num++;

    // 新しい予定のタイトルを作成
    var title = "テニス" + num;

    // 予定を作成
    var startTime = new Date();
    startTime.setHours(8, 55, 0, 0);
    var endTime = new Date(startTime.getTime() + 85 * 60 * 1000);
    var event = CalendarApp.getDefaultCalendar().createEvent(title, startTime, endTime);

    // 振り込み必要？
    var needBankTransfer = false;
    if (num % 8 == 7) {
        needBankTransfer = true;
    }
    return {
        info: `${event.getTitle()} を追加しました。`,
        warn: needBankTransfer ? "振り込みが必要です。" : ""
    }
}
