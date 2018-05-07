import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Tasks } from '../api/tasks.js';

// Components
import Task from './Task.js';
import AccountsUIWrapper from './AccountsUIWrapper.js';


class App extends Component {
  constructor(props) {
    super(props);

    this.textInput = null;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleHideCompleted = this.toggleHideCompleted.bind(this);

    this.state = {
      hideCompleted: false,
      taskText: "",
    };
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  isPalindrome(string) {
    // Remove non word characters
    const word = string.replace(/[^A-Z0-9]/ig, '').toLowerCase();

    // Reverse, Reverse
    const wordReversed = word.split('').reverse().join('');

    // Check
    return word === wordReversed;
  }

  handleSubmit(event) {
    event.preventDefault();

    const text = this.state.taskText;

    // Is it a Palindrom?
    if (this.isPalindrome(text)) {
      Meteor.call('tasks.insert', text);
    } else {
      alert('Not a palindrom. Fix it.');
    }

    // Clear form
    this.setState({ taskText: '' });
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;

    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }

    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.incompleteCount})</h1>
          <label className="hide-completed" htmlFor="hideCompleted">
            <input
              name="hideCompleted"
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted}
            />
              Hide Completed Tasks
          </label>

          <AccountsUIWrapper />

          { this.props.currentUser ?
            <form className="new-task" onSubmit={this.handleSubmit} >
              <input
                type="text"
                name="taskText"
                onChange={this.handleChange}
                ref={this.setTextInputRef}
                placeholder="Type to add new tasks"
                value={this.state.taskText}
              />
            </form> : ''
            }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    text: PropTypes.string,
    createdAt: PropTypes.instanceOf(Date),
    owner: PropTypes.string,
    username: PropTypes.string,
  })),
  incompleteCount: PropTypes.number,
  currentUser: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
  }),
};

App.defaultProps = {
  tasks: null,
  incompleteCount: null,
  currentUser: null,
};


export default withTracker(() => {
  Meteor.subscribe('tasks');
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
})(App);
