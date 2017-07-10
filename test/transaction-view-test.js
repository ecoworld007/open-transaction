'use strict'

const app = require('../server/server.js');
const supertest = require('supertest')(app);
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('Transaction view service test cases', () => {
    let authorization;
    before((done) => {
        let userCredentials = {
            "email": "bob@doe.com",
            "password": "password"
        }
        supertest.post('/api/Users/login')
            .expect(200)
            .send(userCredentials)
            .end((err, res) => {
                if (err) {
                    throw err;
                } else {
                    res.status.should.equal(200);
                    expect(res.body).to.have.a.property('id');
                    authorization = res.body.id;
                    done();
                }
            });
    });

    describe('Integration test cases', () => {
        it('should fetch Transactions for given account', (done) => {
            supertest.get('/api/transactions?AccountNumber=755606772988216&SortCode=asd')
                .set('Authorization', authorization)
                .set('Content-Type', 'application/json')
                .end((err, res) => {
                    if (err) {
                        throw err;
                    } else {
                        res.status.should.equal(200);
                        expect(res.body).to.have.a.property('Transactions');
                        expect(res.body).to.have.a.property('ThirdpartyOutput');
                        done();
                    }
                });
        });

        it('should fail fetch Transactions for missing required query param', (done) => {
            supertest.get('/api/transactions?AccountNumber=755606772988216')
                .set('Authorization', authorization)
                .set('Content-Type', 'application/json')
                .end((err, res) => {
                    if (err) {
                        throw err;
                    } else {
                        res.status.should.equal(400);
                        done();
                    }
                });
        });
    });

    describe('component test cases', () => {
        let originalFindTransactions, originalGreeting;
        before((done) => {
            console.log('inside before hook...');
            originalFindTransactions = app.models.Transaction.find;
            originalGreeting = app.dataSources.Greeting.find;
            app.dataSources.Greeting.find = (cb) => {
                return cb(null, null);
            }
            app.models.Transaction.find = (filter, cb) => {
                return cb(null, null);
            }
            done();
        });

        after((done) => {
            console.log('inside after hook...');
            app.models.Transaction.find = originalFindTransactions;
            app.dataSources.Greeting.find = originalGreeting;
            done();
        });

        it('should fail as third party server internal error', (done) => {
            supertest.get('/api/transactions?AccountNumber=755606772988216&SortCode=asd')
                .set('Authorization', authorization)
                .set('Content-Type', 'application/json')
                .end((err, res) => {
                    if (err) {
                        throw err;
                    } else {
                        res.status.should.equal(500);
                        done();
                    }
                });
        });

        it('should fail authorization when no valid authorization token is passed', (done) => {
            supertest.get('/api/transactions?AccountNumber=755606772988216&SortCode=asd')
                .set('Content-Type', 'application/json')
                .end((err, res) => {
                    if (err) {
                        throw err;
                    } else {
                        res.status.should.equal(401);
                        done();
                    }
                });
        });
    })
})
