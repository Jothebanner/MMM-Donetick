Module.register("MMM-Donetick", {
  defaults: {
    exampleContent: "This is example content",
    serverUrl: "",
    apiPath: "/eapi/v1/chore",
    secretkey: ""
  },

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["donetick.css"];
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    this.chore_list = [];

    // Log.info("**** Starting module donetick ****")
    this.requestChores();
    setInterval(() => this.requestChores(), 10000);
  },

  /**
   * Handle notifications received by the node helper.
   * So we can communicate between the node helper and the module.
   *
   * @param {string} notification - The notification identifier.
   * @param {any} payload - The payload data`returned by the node helper.
   */
  socketNotificationReceived: function (notification, payload) {
    if (notification === "CHORE_LIST") {
      if (this.chore_list !== payload) {
        // this.chore_list = payload.chore_list;
        // Log.info("**** notification received! :D ****")
        // Log.info(payload);
        this.chore_list = payload;
        this.updateDom(1000);
      }
    }
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div");
    let choreListHTML = "";
    let anyPastDueOrDueToday = false;
    if (this.chore_list.length > 0) {
      //tomorrow, yesterday, and today
      let today = new Date();
      let yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      this.chore_list.forEach((chore) => {
        let choreHTML;
        if (chore.notification) {
          let warning = false;
          let choreDueDate = new Date(chore.nextDueDate);
          let dayOfWeek;

          switch (choreDueDate.getDate()) {
            case today.getDate():
              dayOfWeek = "Today";
              anyPastDueOrDueToday = true
              break;
            case yesterday.getDate():
              {
                dayOfWeek = "Yesterday"
                anyPastDueOrDueToday = true
              } // what the fuck
              break;
            case tomorrow.getDate():
              dayOfWeek = "Tomorrow";
              break;
            default:
              dayOfWeek = choreDueDay.toLocaleString("en-US", {
                weekday: "long"
              });
          }

          // if the due date has passed then activate the warning
          if (choreDueDate - today < 0) {
            warning = true;
          }

          let timeDue = choreDueDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          });

          choreHTML = `<div class="chore-row">
          <div class="chore-title">${chore.name}</div>
          <div class="chore-time ${warning ? "warning-text" : ""}">Due ${dayOfWeek}${" at " + timeDue}</div>
          </div>`;
          choreListHTML += choreHTML;
        }
      });
    }


    if (anyPastDueOrDueToday === false) {
      choreListHTML = `<div class="casual-text">All done for today! ^_^</div>` + choreListHTML
    }

    wrapper.innerHTML = `<div class="chore-container">${choreListHTML}</div>`;

    return wrapper;
  },

  requestChores() {
    this.sendSocketNotification("GET_CHORE_LIST", { config: this.config });
  },

  /**
   * This is the place to receive notifications from other modules or the system.
   *
   * @param {string} notification The notification ID, it is preferred that it prefixes your module name
   * @param {number} payload the payload type.
   */
  notificationReceived(notification, payload) {
    if (notification === "TEMPLATE_RANDOM_TEXT") {
      this.templateContent = `${this.config.exampleContent} ${payload}`;
      this.updateDom(1000);
    }
  }
});
