import clock from 'clock';
import * as document from "document";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { preferences } from 'user-settings';
import * as util from '../common/utils';
import { FitFont } from 'fitfont'

let bodyPresence;
let hrm;
let isHeartHidden = true;

function checkHeartRate() {
  const currentHRText = document.getElementById("currentHRText");
  hrm = new HeartRateSensor({ frequency: 1 });
  if (HeartRateSensor && currentHRText) {
    hrm.addEventListener("reading", () => {
      currentHRText.text = util.monoDigits(hrm.heartRate);
    });
    hrm.start();
  }
}

function checkBodyPresence() {
  if (BodyPresenceSensor) {
    bodyPresence = new BodyPresenceSensor();
    bodyPresence.addEventListener("reading", () => {
      if (!bodyPresence.present) {
        hrm.stop();
      } else {
        hrm.start();
      }
    });
    bodyPresence.start();
  }
}

function enableHRView() {
  checkHeartRate();
  checkBodyPresence();
}

function initiateHeartUI() {
  const touchTarget = document.getElementById('full-screen-touch-target');
  const hrView = document.getElementById('heart-view');

  const row1 = document.getElementById('row1');
  const row2 = document.getElementById('row2');
  const date = document.getElementById('date');
  const dateContainer = document.getElementById('date-container');

  touchTarget.addEventListener('click', () => {
    if (isHeartHidden) {
      row1.style.display = 'none';
      row2.style.display = 'none';
      date.style.display = 'none';
      dateContainer.style.display = 'none';
      // show heart rate
      enableHRView();
      hrView.style.display = 'inline';
      isHeartHidden = false;

    } else {
      hrm.stop();
      bodyPresence.stop()
      hrView.style.display = 'none';
      // show time and date
      row1.style.display = 'inline';
      row2.style.display = 'inline';
      date.style.display = 'inline';
      dateContainer.style.display = 'inline';
      isHeartHidden = true;
    }
  });
}

/* -------- CLOCK SCREEN -------- */
// Update the clock every minute
clock.granularity = 'minutes';

// declaration of the FitFont objects
const row1 = new FitFont({ id: 'row1', font: 'Rubik_200' });
const row2 = new FitFont({ id: 'row2', font: 'Rubik_200' });

const dateBox = document.getElementById('date');

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
    // evt.date.toString()
    //Wed May 13 2020 13:28:00 GMT-07:00
    let today = evt.date;
    let hours = today.getHours();

    if (preferences.clockDisplay === '12h') {
        // 12h format
        hours = hours % 12 || 12;
    } else {
        // 24h format
        hours = util.zeroPad(hours);
    }

    let mins = util.zeroPad(today.getMinutes());

    row1.text = `${hours}`;
    row2.text = `${mins}`;
    dateBox.text = util.monoDigits(today.getDate());
}

// let's go!
initiateHeartUI();



