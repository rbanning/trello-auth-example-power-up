// window.TrelloPowerUp.initialize({
//   'board-buttons': (t) => {
//     return [
//       {
//         text: "Reset Members",
//         icon: null,
//         condition: 'edit',
//         callback: (t) => {
//           console.log("DEBUG: running BoardMembership.resetMembership");
//           BoardMembership.resetMembership(t, 'normal', 'observer');
//         }
//       }
//     ];
//   }
// });

// const resetMembership = (t, target, resetTo) => {

//   t.board('id', 'members', 'memberships')
//   .then(board => {
//     const affected = board.memberships
//                     .filter(m => m.memberType === target)
//                     .map(m => m.idMember);

//     if (affected.length === 0) {
      
//       t.alert({
//         message: 'No members need updating',
//         display: 'warning'
//       });

//     } else {

//       // HERE IS THE PROBLEM //
//       t.popup({
//         type: "confirm",
//         title: 'Reset Board Membership',
//         message: "Are you sure you want to reset members?",
//         confirmText: 'Proceed',
//         onConfirm: () => {
//           console.log("OK");
//         }
//       });

//     }
//   });
// };

// t.modal({
//   title: 'Testing',
//   accentColor: 'red',
//   url: './local-test.html',
//   fullscreen: false,
//   height: 300
// });
