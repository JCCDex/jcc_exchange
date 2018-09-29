const jcExchange = require('../src/index.js');
const {
    formatCreate,
    formatCancel,
    formatTransfer
} = require('../src/tx');
const chai = require('chai');
const expect = chai.expect;
const fetch = require('jcc_rpc/lib/fetch');
const MockAdapter = require('axios-mock-adapter');
const mock = new MockAdapter(fetch);
let testAddress = 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH';
let testSecret = 'snfXQMEVbbZng84CcfdKDASFRi4Hf';
let issuer = 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or';

describe('test jc exchange', function () {
    describe('test formatCreate', function () {

        it('use cny to buy swt', function () {
            let tx = formatCreate(0, 'swt', 'cny', issuer, testAddress, 1, 0.03);
            expect(tx).to.deep.equal({
                Flags: 0,
                Fee: 0.00001,
                Account: 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH',
                TransactionType: 'OfferCreate',
                TakerGets: {
                    value: 0.03,
                    currency: 'CNY',
                    issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or'
                },
                TakerPays: 1
            });
        })

        it('use swt to buy jjcc', function () {
            let tx = formatCreate(0, 'jjcc', 'swt', issuer, testAddress, 1, 0.5);
            expect(tx).to.deep.equal({
                Flags: 0,
                Fee: 0.00001,
                Account: 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH',
                TransactionType: 'OfferCreate',
                TakerGets: 0.5,
                TakerPays: {
                    value: 1,
                    currency: 'JJCC',
                    issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or'
                }
            });
        })

        it('sell swt to get cny', function () {
            let tx = formatCreate(1, 'swt', 'cny', issuer, testAddress, 1, 0.03);
            expect(tx).to.deep.equal({
                Flags: 524288,
                Fee: 0.00001,
                Account: 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH',
                TransactionType: 'OfferCreate',
                TakerGets: 1,
                TakerPays: {
                    value: 0.03,
                    currency: 'CNY',
                    issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or'
                }
            });
        })

        it('sell jjcc to get cny', function () {
            let tx = formatCreate(1, 'jjcc', 'swt', issuer, testAddress, 1, 0.4);
            expect(tx).to.deep.equal({
                Flags: 524288,
                Fee: 0.00001,
                Account: 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH',
                TransactionType: 'OfferCreate',
                TakerGets: {
                    value: 1,
                    currency: 'JJCC',
                    issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or'
                },
                TakerPays: 0.4
            });
        })

        it('if the type is not 0 or 1', function () {
            let tx = formatCreate(3, 'jjcc', 'swt', issuer, testAddress, 1, 0.4);
            expect(tx).to.equal(null);
        })
    })

    describe('test formatCancel', function () {
        it('format correctly', function () {
            let tx = formatCancel(testAddress, 1);
            expect(tx).to.deep.equal({
                Flags: 0,
                Fee: 0.00001,
                Account: 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH',
                TransactionType: 'OfferCancel',
                OfferSequence: 1
            })
        })

    })

    describe('test formatTransfer', function () {
        it('transfer swt', function () {
            let tx = formatTransfer('swt', 1, testAddress, '123456', issuer, 'test')
            expect(tx).to.deep.equal({
                Flags: 0,
                Account: 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH',
                TransactionType: 'Payment',
                Destination: '123456',
                Memos: [{
                    Memo: {
                        MemoType: 'string',
                        MemoData: 'test'
                    }
                }],
                Fee: 0.00001,
                Amount: 1
            })
        })

        it('transfer cny', function () {
            let tx = formatTransfer('cny', 1, testAddress, '123456', issuer, 'test')
            expect(tx).to.deep.equal({
                Flags: 0,
                Account: 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH',
                TransactionType: 'Payment',
                Destination: '123456',
                Memos: [{
                    Memo: {
                        MemoType: 'string',
                        MemoData: 'test'
                    }
                }],
                Fee: 0.00001,
                Amount: {
                    value: 1,
                    currency: 'CNY',
                    issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or'
                }
            })
        })
    })

    describe('test createOrder', function () {

        it('create order successfully', function (done) {
            this.timeout(0)
            let testData = {
                counter: 'cny',
                base: 'jjcc',
                issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or',
                account: testAddress,
                type: 0,
                amount: 1,
                sum: 0.4,
                secret: testSecret,
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: 200
                }
            })
            mock.onPost('/exchange/sign_order').reply(200, {
                code: '0'
            });

            jcExchange.createOrder(testData).then(res => {
                expect(true)
                done()
            })
        })

        it('if the type is wrong', function (done) {
            let testData = {
                counter: 'cny',
                base: 'jjcc',
                issuer: '',
                account: '',
                type: 3,
                amount: 1,
                sum: 0.4,
                secret: '',
                hosts: [],
                port: 443,
                https: true
            }
            jcExchange.createOrder(testData).catch(error => {
                expect(error.message).to.equal('exchange type error');
                done()
            })
        })

        it('get sequence wrongly', function (done) {
            let testData = {
                counter: 'cny',
                base: 'jjcc',
                issuer: '',
                account: '',
                type: 0,
                amount: 1,
                sum: 0.4,
                secret: '',
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '109',
                msg: 'account is invalid'
            })
            jcExchange.createOrder(testData).catch(error => {
                expect(error.message).to.equal('account is invalid');
                done()
            })
        })

        it('local singature failed', function (done) {
            let testData = {
                counter: 'cny',
                base: 'jjcc',
                issuer: '',
                account: '',
                type: 0,
                amount: 1,
                sum: 0.4,
                secret: '',
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: '200'
                }
            })
            jcExchange.createOrder(testData).catch(error => {
                expect(error.message).to.equal('local signature failed');
                done()
            })
        })

        it('create order failed', function (done) {
            let testData = {
                counter: 'cny',
                base: 'jjcc',
                issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or',
                account: testAddress,
                type: 0,
                amount: 1,
                sum: 0.4,
                secret: testSecret,
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: 200
                }
            })
            mock.onPost('/exchange/sign_order').reply(200, {
                code: '100',
                msg: 'balance is not enough'
            });
            jcExchange.createOrder(testData).catch(error => {
                expect(error.message).to.equal('balance is not enough');
                done()
            })
        })
    })

    describe('test cancelOrder', function () {

        it('cancel order successfully', function (done) {
            this.timeout(0)
            let testData = {
                offerSequence: 200,
                account: testAddress,
                secret: testSecret,
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: 200
                }
            })
            mock.onDelete('/exchange/sign_cancel_order').reply(200, {
                code: '0'
            });

            jcExchange.cancelOrder(testData).then(res => {
                expect(true)
                done()
            })
        })

        it('get sequence wrongly', function (done) {
            let testData = {
                offerSequence: 200,
                account: testAddress,
                secret: testSecret,
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '109',
                msg: 'account is invalid'
            })
            jcExchange.cancelOrder(testData).catch(error => {
                expect(error.message).to.equal('account is invalid');
                done()
            })
        })

        it('local singature failed', function (done) {
            let testData = {
                offerSequence: 200,
                account: testAddress,
                secret: testSecret,
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: '200'
                }
            })
            jcExchange.cancelOrder(testData).catch(error => {
                expect(error.message).to.equal('local signature failed');
                done()
            })
        })

        it('cancel order failed', function (done) {
            let testData = {
                offerSequence: 200,
                account: testAddress,
                secret: testSecret,
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: 200
                }
            })
            mock.onDelete('/exchange/sign_cancel_order').reply(200, {
                code: '100',
                msg: 'failed'
            });
            jcExchange.cancelOrder(testData).catch(error => {
                expect(error.message).to.equal('failed');
                done()
            })
        })
    })

    describe('test transferAccount', function () {

        it('transfer account successfully', function (done) {
            this.timeout(0)
            let testData = {
                currency: 'swt',
                amount: 1,
                address: testAddress,
                secret: testSecret,
                to: 'jEaAWgAxr8fcVSNNeKprbD7UK4JUxnCn9C',
                issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or',
                memo: 'test',
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: 200
                }
            })
            mock.onPost('/exchange/sign_payment').reply(200, {
                code: '0',
                data: {
                    hash: '111111'
                }
            });

            jcExchange.transferAccount(testData).then(res => {
                expect(true)
                done()
            })
        })

        it('get sequence wrongly', function (done) {
            let testData = {
                currency: 'swt',
                amount: 1,
                address: testAddress,
                secret: testSecret,
                to: 'jEaAWgAxr8fcVSNNeKprbD7UK4JUxnCn9C',
                issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or',
                memo: 'test',
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '109',
                msg: 'account is invalid'
            })
            jcExchange.transferAccount(testData).catch(error => {
                expect(error.message).to.equal('account is invalid');
                done()
            })
        })

        it('local singature failed', function (done) {
            let testData = {
                currency: 'swt',
                amount: 1,
                address: testAddress,
                secret: testSecret,
                to: 'jEaAWgAxr8fcVSNNeKprbD7UK4JUxnCn9C',
                issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or',
                memo: 'test',
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: '200'
                }
            })
            jcExchange.transferAccount(testData).catch(error => {
                expect(error.message).to.equal('local signature failed');
                done()
            })
        })

        it('transfer account failed', function (done) {
            let testData = {
                currency: 'swt',
                amount: 1,
                address: testAddress,
                secret: testSecret,
                to: 'jEaAWgAxr8fcVSNNeKprbD7UK4JUxnCn9C',
                issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or',
                memo: 'test',
                hosts: [],
                port: 443,
                https: true
            }

            mock.onGet(/^\/exchange\/sequence\//).reply(200, {
                code: '0',
                data: {
                    sequence: 200
                }
            })
            mock.onPost('/exchange/sign_payment').reply(200, {
                code: '100',
                msg: 'balance is not enough'
            });
            jcExchange.transferAccount(testData).catch(error => {
                expect(error.message).to.equal('balance is not enough');
                done()
            })
        })
    })
})