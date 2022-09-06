import React, { Component } from 'react';
import axios from 'axios';
import {Link, Redirect} from 'react-router-dom';
import Header from "../elements/header";
import Sidebar from "../elements/sidebar";

export default class EditPage extends Component {

    constructor(props) {
        super(props);
        this.token = localStorage.getItem('token');
    }

    state = {
        id: '',
        redirect: false,
        isLoading: false
    };

    componentDidMount() {
        const url = 'http://localhost:4000/customer/edit';
        const id = this.props.location.search[4];
        console.log(id);
        axios.post(url, {id: id})
            .then(response => {
                const customer = response.data.mydata;
                console.log(response.data.gps_location);
                this.setState({id: customer[0]['cu_id'] });

                document.getElementById('inputName').value = customer[0]['name'];
                document.getElementById('inputPhone').value = customer[0]['phone_no'];
                document.getElementById('inputaddress').value = customer[0]['address'];
                document.getElementById('inputLoca').value = response.data.gps_location;
                document.getElementById('inputCuid').value = customer[0]['co_id'];
                document.getElementById('inputCnic').value = customer[0]['cnic'];
            })
            .catch(error => {
                this.setState({ toDashboard: true });
                console.log(error);
            });
        
    }

    handleSubmit = event => {
        event.preventDefault();
        this.setState({isLoading: true});
        const token = localStorage.getItem('token');
        const url = 'http://localhost:4000/customer/update';
        const name = document.getElementById('inputName').value;
        const phone = document.getElementById('inputPhone').value;
        const address = document.getElementById('inputaddress').value;
        const location = document.getElementById('inputLoca').value;
        const control_unit = document.getElementById('inputCuid').value;
        const cnic = document.getElementById('inputCnic').value;

        console.log(this.state.id);

        axios.post(url,{name: name,address: address,phone: phone,location: location,control_unit: control_unit,cnic: cnic, id: this.state.id})
            .then(result => {
                if (result.data.status) {
                    this.setState({redirect: true, isLoading: false})
                }
            })
            .catch(error => {
                console.log(error);
            });
    };

    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to='/index' />
        }
    };

    render() {
        const isLoading = this.state.isLoading;
        if (this.state.toDashboard === true) {
            return <Redirect to='/' />
        }
        return (
            <div>
                <Header/>
                <div id="wrapper">
                    <Sidebar></Sidebar>
                    <div id="content-wrapper">
                        <div className="container-fluid">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <Link to={'/dashboard'} >Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active">edit</li>
                            </ol>
                        </div>
                        <div className="container-fluid">
                            <div className="card mx-auto">
                                <div className="card-header">Customer edit</div>
                                <div className="card-body">
                                    <form onSubmit={this.handleSubmit}>
                                        <div className="form-group">
                                            <div className="form-row">
                                                <div className="col-md-6">
                                                    <div className="form-label-group">
                                                        <input type="text" id="inputName" className="form-control" placeholder="Enter name" required="required" autoFocus="autofocus" />
                                                        
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-label-group">
                                                        <input type="number" id="inputPhone" className="form-control" placeholder="Enter Phone" required="required" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="form-row">
                                                <div className="col-md-6">
                                                    <div className="form-label-group">
                                                        <input type="text" id="inputaddress" className="form-control" placeholder="Enter address" required="required" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-label-group">
                                                        <input type="number" id="inputCnic" className="form-control" placeholder="Enter Cnic" required="required"/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="form-row">
                                                <div className="col-md-6">
                                                    <div className="form-label-group">
                                                        <input type="number" id="inputCuid" className="form-control" placeholder="Control Unit ID" required="required" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-label-group">
                                                        <input type="text" id="inputLoca" className="form-control" placeholder="Unit Location" required="required"/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-block" type="submit" disabled={this.state.isLoading ? true : false}>Update Customer &nbsp;&nbsp;&nbsp;
                                            {isLoading ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                             ) : (
                                                 <span></span>
                                             )}
                                        </button>
                                    </form>
                                    {this.renderRedirect()}
                                </div>
                            </div>
                        </div>

                        <footer className="sticky-footer">
                            <div className="container my-auto">
                                <div className="copyright text-center my-auto">
                                    <span>Copyright © Your Website <div>{(new Date().getFullYear())}</div></span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        );
    }
}


