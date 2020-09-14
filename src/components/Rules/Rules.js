import React from 'react';
import rules1 from '../../images/rules1.png';
import rules2 from '../../images/rules2.png';
import './Rules.css';

const Rules = () => {
  
  return (
    <div className="instructions">
      <h3>How to play!</h3>
      <p>Going around in a circle, each player takes a turn to put one piece on the board.</p>
      <p>For your first turn your piece's corner must touch one corner of the board.</p>
      <p><img src={rules1} alt="rules 1"/></p>
      <p>Every subsequent piece you put on the board must touch at least one corner of another one of your pieces.</p>
      <p><img src={rules2} alt="rules 2"/></p>
      <p>Your pieces may not touch each other's sides, and must not overlap any other piece.</p>
      <p>If someone manages to put all of their pieces on the board, they win!</p>
      <p>If the game reaches a point where no one can put any more pieces on the board, everyone should count the number of squares they have left that haven't been placed on the board.</p>
      <p>The person with the lowest number wins!</p>
      <p>Note: Click on a piece to turn it and flip it!</p>
    </div>
  )
};

export default Rules;