import React from 'react';
import { Link } from 'react-router';
import {schema} from './ProjectForm.js';

const config = require('../config');
const apiRoot = config.api_root;
const ordering = [
  'name',
  'description',
  'published',
  'project_delays',
  'status',
  'planned_start_date',
  'actual_start_date',
  'planned_end_date',
  'actual_end_date',
  'number_served',
  'responsible_party',
  'responsible_ministry',
  'project_link',
  'percent_complete',
  'sds_indicator',
  'sdg_indicator',
  'category',
  'location',
  'budget',
  'disbursed',
  'local_manager',
  'amendments',
  'kmi'
];

const sortOrder = {};
ordering.forEach((item, index) => {
  sortOrder[item] = index;
});

class Project extends React.Component {
  componentWillMount () {
    const component = this;
    const id = component.props.location.pathname.replace('/projects/', '');

    component.props.auth.request(`${apiRoot}/projects/${id}`, 'get')
      .then(function (resp) {
        component.setState({
          project: resp,
          id: id
        });
      }).fail(function (err, msg) {
        console.error('error', err, msg);
      });
  }

  render () {
    const component = this;
    if (component.state && component.state.project) {
      const project = component.state.project.data;
      const keys = schema.properties;
      const rows = Object.keys(project).sort(function (a, b) {
        if (sortOrder[a] < sortOrder[b]) { return -1; }
        if (sortOrder[a] > sortOrder[b]) { return 1; }
        return 0;
      }).filter(key => {
        return key !== 'name';
      }).map(function (key) {
        if (!keys[key]) { return <div></div>; }
        if (keys[key].type === 'string') {
          return <li key={key}><label>{keys[key].title}</label>{ String(project[key]) }</li>;
        } else if (key === 'published') {
          return <li key={key}><label>{keys[key].title}</label>{ project[key] ? 'Published' : 'Draft' }</li>;
        } else if (key === 'number_served') {
          return <li key={key}><label>{keys[key].title}</label>{ project[key].number_served + ' ' + project[key].number_served_unit}</li>;
        } else if (key === 'location') {
          const locations = project[key].map((location) => {
            let district = location.district;
            if (district.district) {
              return <li>{district.district + ', ' + district.governorate}</li>;
            } else if (district.governorate) {
              return <li>{district.governorate}</li>;
            } else {
              return <li></li>;
            }
          });
          return <li key={key}><label>{keys[key].title}</label><ul>{locations}</ul></li>;
        } else if (key === 'sds_indicator' || key === 'sdg_indicator' || key === 'category') {
          const indicators = project[key].map((item) => <li>{item}</li>);
          return <li key={key}><label>{keys[key].title}</label><ul>{indicators}</ul></li>;
        } else if (key === 'budget' && project[key].length > 0) {
          const funds = project[key].map((fund) => <li>{fund.donor_name + ': ' + ' $' + fund.fund.amount}</li>);
          return <li key={key}><label>{keys[key].title}</label><ul>{funds}</ul></li>;
        } else if (key === 'disbursed' && project[key].length > 0) {
          const disbursed = project[key].map((fund) => <li>{fund.donor_name + ': ' + fund.type + ' $' + fund.fund.amount + ' ' + fund.date}</li>);
          return <li key={key}><label>{keys[key].title}</label><ul>{disbursed}</ul></li>;
        } else if (key === 'kmi' && project[key].length > 0) {
          const kmis = project[key].map((kmi) => <li>{kmi.activity}<p>{kmi.description}</p><p>{kmi.kpi}</p><p>{kmi.date}</p><p>{kmi.status}</p></li>);
          return <li key={key}><label>{keys[key].title}</label><ul>{kmis}</ul></li>;
        }
      });

      return (
        <div className="project-display wrapper-content width-medium">
          <h1 className="header-page-main">{project.name}</h1>
          <Link className="btn button--primary button-section-header" to={`/projects/${component.state.id}/edit`}>Edit</Link>
          <ul>
            { rows }
          </ul>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

export default Project;
