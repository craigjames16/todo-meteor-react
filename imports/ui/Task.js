import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import { Tasks } from '../api/tasks.js';
import classnames from 'classnames';

// Task component - represents a single todo item
export default class Task extends Component {
  constructor(props) {
    super(props);

    this.toggleChecked = this.toggleChecked.bind(this);
    this.deleteThisTask = this.deleteThisTask.bind(this);
    this.togglePrivate = this.togglePrivate.bind(this);
  }
  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, !this.props.task.private);
  }

  render() {
    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private,
    });

    return (
      <li className={taskClassName}>
        <button className="delete" onClick={this.deleteThisTask}>
          &times;
        </button>

        <input
          type="checkbox"
          readOnly
          checked={!!this.props.task.checked}
          onClick={this.toggleChecked}
        />

        { this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate}>
            { this.props.task.private ? 'Private' : 'Public' }
          </button>
        ) : ''}

        <span className="text">
          <strong>{this.props.task.username}</strong>: {this.props.task.text}
        </span>
      </li>
    );
  }
}

Task.propTypes = {
  task: PropTypes.shape({
    _id: PropTypes.string,
    text: PropTypes.string,
    createdAt:PropTypes.instanceOf(Date),
    owner: PropTypes.string,
    username: PropTypes.string,
    private: PropTypes.boolean,
    checked: PropTypes.boolean
  })
}
