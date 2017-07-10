'use strict';
const Promise = require('bluebird');
const debug = require('debug')('TransactionView');
const error = debug("app:error");
const appLogger = require('../../server/boot/bunyanLogger')
module.exports = (TransactionView) => {
    /**
     * will return greeting message
     */
    let greetMe = () => {
            appLogger.log.info('started greeting...');
            let greeting = Promise.promisify(TransactionView.app.dataSources.Greeting.find);
            return greeting()
                .then((message) => {
                    if (!message) {
                        return Promise.reject();
                    } else {
                        appLogger.log.info('greet message received');
                        return message;
                    }
                }).catch((error) => {
                    return Promise.reject({ message: 'No Greeting. Damn rude', code: '500' });
                });
        }
    /**
     * will give transactions for given account number
     * @param {string} AccountNumber account number for which transactions is needed
     * @param {string} SortCode
     */
    let myTransactions = (AccountNumber, SortCode) => {
        appLogger.log.info('started getting transaction...');
        let getTransactions = Promise.promisify(TransactionView.app.models.Transaction.find, { context: TransactionView.app.models.Transaction });
        let filter = { PermanentAccountNumber: AccountNumber };
        return getTransactions({ where: filter })
            .then((transactions) => {
                if (!transactions) {
                    return Promise.reject();
                } else {
                    appLogger.log.info('transactions received');
                    return transactions;
                }
            }).catch((error) => {
                return Promise.reject({ message: 'Error Finding Transactions', code: '500' });
            });
    }

    TransactionView.getAccountTransactions = (AccountNumber, SortCode, cb) => {
        let processPromise = () => {
            return Promise.all([
                myTransactions(AccountNumber, SortCode),
                greetMe()
            ]).spread((transactions, greetMessage) => {
                let response = {
                    "Transactions": transactions,
                    "ThirdpartyOutput": greetMessage
                }
                cb(null, response);
            });
        }
        processPromise().catch((error) => {
            appLogger.log.error(error);
            cb(error, null);
        });
    };


    TransactionView.remoteMethod('getAccountTransactions', {
        accepts: [{
            arg: 'AccountNumber',
            type: 'string',
            description: 'account number for which transactions is needed',
            required: true,
            http: { source: 'query' }
        }, {
            arg: 'SortCode',
            type: 'string',
            required: true,
            http: { source: 'query' }
        }],
        returns: [{
            description: 'Get Transaction Successful Response',
            type: 'TransactionView',
            arg: 'data',
            root: true
        }],
        http: { path: '/transactions', verb: 'get', status: 200 }
    });
};
