const Content = require('../models/content').Contents;
const User = require('../models/user').Users;
const utils = require('../helpers/utils');
const chai_http = require('chai-http');
const server = require('./test');
const chai = require('chai')

chai.use(chai_http);

const describe = require('mocha').describe;
const should = chai.should;
const expect = chai.expect;

describe('User', function () {
  const USER_URL = '/api/user';
  const username = 'test_user_2';
  const password = 'test_password_2';
  const email = 'test2@test.com';
  let user_id;

  const title_1 = 'Spiderman';
  const title_2 = 'Black Mirror';
  const category_1 = 'movie';
  const category_2 = 'tv';
  let content_1 = {};
  let content_2 = {};
  let send_content_1 = {};
  let send_content_2 = {};
  let token;

  beforeEach(async () => {
    await User.deleteMany({});
    await Content.deleteMany({});
    content_1 = { title: { text: title_1 }, category: category_1 };
    content_2 = { title: { text: content_2 }, category: category_2, rate: 5, comment: 'test comment' };
    send_content_1 = { title: title_1, category: category_1 };
    send_content_2 = { title: title_2, category: category_2, rate: 5, comment: 'test comment' };
    const user = new User({ username, email, password });
    token = await utils.generateToken(user._id);
    await user.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Content.deleteMany({});
  });

  describe('POST /api/user/:username/content', function () {
    it('It should add content with the title and categoty=movie', async function () {
      const res = await chai.request(server)
        .post(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token)
        .send(send_content_1);

      expect(res).to.have.status(200);
      const added = (await User.findOne({ username })).contents
      expect(added).to.have.lengthOf(1);
    });

    it('It should add content with the title and categoty=tv', async function () {
      const res = await chai.request(server)
        .post(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token)
        .send(send_content_2);
      expect(res).to.have.status(200);
      const added = (await User.findOne({ username })).contents
      expect(added).not.to.be.null;
      expect(added).to.have.lengthOf(1);
    });

    it('It should add content with all the info', async function () {
      const res = await chai.request(server)
        .post(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token)
        .send(send_content_2);
      expect(res).to.have.status(200);
      const added = (await User.findOne({ username })).contents
      expect(added).to.have.lengthOf(1);
      expect(added[0].rate).to.equal(5);
      expect(added[0].comment).to.equal('test comment');
    });

    it('It should add content not duplicated', async function () {
      await chai.request(server)
        .post(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token)
        .send(send_content_2);

      await chai.request(server)
        .post(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token)
        .send(send_content_2);

      const size = (await User.findOne({ username })).contents.length;
      expect(size).to.equal(1);
    });

  });

  describe('GET /api/user/:username/content', function () {
    it('It should get the user\'s content', async function () {
      await chai.request(server)
        .post(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token)
        .send(send_content_2);

      await chai.request(server)
        .post(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token)
        .send(send_content_1);

      const res = await chai.request(server)
        .get(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token);

      expect(res).to.have.status(200);
      expect(res.body).to.have.lengthOf(2);
    });
  });

  describe('PUT /api/user', function () {

  });

  describe('DELETE /api/user/:username/content', function () {
    it('It should delete a user content', async function () {
      const id = (await chai.request(server)
        .post(USER_URL + '/' + username + '/content')
        .type('json')
        .set('authorization', token)
        .send(send_content_1)).body.content;

      const res = await chai.request(server)
        .delete(USER_URL + '/' + username + '/content/')
        .type('json')
        .set('authorization', token)
        .send({
          ids: [id]
        });

      expect(res).to.have.status(200);
      user = await User.findOne({ username, $contents: { info: { title: { 'id': id } } } });
      expect(user.contents).to.be.empty;
    });
  });

});

