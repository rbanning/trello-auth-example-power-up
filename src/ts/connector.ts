import {env} from './_common';

console.log("connector", {env});



(window as any).TrelloPowerUp.initialize({
  'board-buttons': (t) => {
    return [
      {
        text: 'Meeting Summary',
        condition: 'edit',
        callback: meetingSummary 
      }
    ]
  }
});


function meetingSummary(t) {
  return t.popup({
    title: 'Meeting Summary',
    url: './meeting-summary.html',
    height: 300
  });
}
