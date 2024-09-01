import Action from "./timers/action";
import { timerChannel, time_data, data_value } from "./types";

export class TimerChannelsClass {
  private use_timer_channels: timerChannel[] = [];
  private data: time_data = new Map<string, data_value>() as time_data;

  setTimerChannels(timerChannels: timerChannel[]) {
    this.use_timer_channels = timerChannels;
    this.addUserToData();
  }

  endOfDay() {
    this.data.forEach((value, _) => {
      if (value.workingStart && !value.workingEnd) {
        value.workingEnd = Date.now();
      }
    });
    Action(this.data);
    this.clearDataWithUserId();
  }

  startWorking(userId: string) {
    const user = this.data.get(userId);
    if (user) {
      if (user.workingEnd !== undefined) {
        // 休憩後に作業再開
        user.whileBreakTime += Date.now() - user.workingEnd;

        user.workingEnd = undefined; // 作業再開時に終了時間をリセット
      } else {
        // 初めての作業開始
        user.workingStart = Date.now();
      }
    } else if (
      this.use_timer_channels.some((channel) => channel.userId === userId)
    ) {
      // 新規ユーザーの場合
      this.data.set(userId, {
        workingStart: Date.now(),
        workingEnd: undefined,
        whileBreakTime: 0,
      });
    }
  }

  getData() {
    return this.data;
  }

  setData(data: time_data) {
    data.forEach((value, key) => {
      this.data.set(key, value);
    });
  }

  stopWorking(userId: string) {
    const user = this.data.get(userId);
    if (user && user.workingStart !== undefined) {
      user.workingEnd = Date.now(); // 作業を停止
    }
  }
  private clearDataWithUserId() {
    this.data.forEach((_, key) => {
      this.data.set(key, {
        workingStart: undefined,
        workingEnd: undefined,
        whileBreakTime: 0,
      });
    });
  }

  private addUserToData() {
    this.use_timer_channels.forEach((channel) => {
      if (!this.data.has(channel.userId)) {
        this.data.set(channel.userId, {
          workingStart: undefined,
          workingEnd: undefined,
          whileBreakTime: 0,
        });
      }
    });
  }

  getTimerChannels() {
    return this.use_timer_channels;
  }
}
