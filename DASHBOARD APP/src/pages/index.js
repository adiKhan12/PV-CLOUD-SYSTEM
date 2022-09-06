import React, { Component } from 'react';
import Header from "../elements/header";
import Sidebar from "../elements/sidebar";
import {Link, Redirect} from 'react-router-dom';
import axios from 'axios';

export default class Index extends Component {
    state = {
        customers: [],
        toDashboard: false,
        isLoading: false
    };

    constructor(props) {
        super(props);
        this.url = 'http://localhost:4000/customers';
        this.token = localStorage.getItem('token');
    }

    componentDidMount() {
        axios.get(this.url , { params: { token: this.token}})
            .then(response => {
                const customers = response.data.result;
                console.log(response.data.result);
                this.setState({ customers });
            })
            .catch(error => {
                this.setState({ toDashboard: true });
                console.log(error);
            });
            
    }

    handleClickDelete = event => {
        axios.delete(this.url + '/' + event.target.value , { params: { token: this.token}})
            .then(response => {
                this.componentDidMount();
                this.setState({ isLoading: true})
            })
            .catch( error => {
                console.log(error.toString());
                this.setState({ toDashboard: true });
            });
    };

    render() {
        if (this.state.toDashboard === true) {
            return <Redirect to='/' />
        }
        return (
            <div>
                <Header/>
                <div id="wrapper">
                    <Sidebar/>
                    <div id="content-wrapper">
                        <div className="container-fluid">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <Link to={'/dashboard'} >Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active">Customers</li>
                                <li className="ml-auto"><Link to={'add'}>Add Customers</Link></li>
                            </ol>
                            <div className="card mb-3">
                                <div className="card-header"><i className="fas fa-table"></i>
                                    &nbsp;&nbsp;Customers list
                                </div>
                                <div className="card-body">
                                    <table className="table table-bordered">
                                        <thead>
                                        <tr>
                                            <th>id</th>
                                            <th>Name</th>
                                            <th>Address</th>
                                            <th>Control Unit</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.customers.map((customers , index)=>
                                                <tr key={customers.cu_id}>
                                                    <td>{index + 1}</td>
                                                    <td>{customers.name}</td>
                                                    <td>{customers.address}</td>
                                                    <td>{customers.co_id}</td>
                                                    <td className="text-center">
                                                        <Link className="btn btn-sm btn-info" to={{ pathname: 'edit', search: '?id=' + customers.cu_id }}>Edit</Link>
                                                        &nbsp; | &nbsp;
                                                        <button value={customers.cu_id} className="btn btn-sm btn-danger" disabled={false} onClick={this.handleClickDelete} >Delete</button>
                                                    </td>
                                                </tr>)
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="card-footer small text-muted">Updated yesterday at 11:59 PM</div>
                            </div>
                        </div>
                        <footer className="sticky-footer">
                            <div className="container my-auto">
                                <div className="copyright text-center my-auto">
                                    <span>Copyright © Your Website 2019</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        );
    }
}
