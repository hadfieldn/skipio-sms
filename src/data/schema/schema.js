import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { globalIdField, fromGlobalId, nodeDefinitions } from 'graphql-relay';
import _ from 'lodash';
import qs from 'qs';
import keysToCamelCase from './keysToCamelCase';

const schemaForEnv = env => {

  // Resolver functions

  const BASE_URL = `${env.server}/api/${env.apiVersion}`;

  function fetchResponseByURL(relativeURL, options = {}) {
    const queryParams = options.queryParams || {};
    const fetchParams = options.fetchParams || {};
    const query = qs.stringify({ ...queryParams, token: env.apiToken });
    return fetch(`${BASE_URL}${relativeURL}?${query}`, fetchParams);
  }

  function fetchDataByURL(relativeURL, options = {}) {
    return fetchResponseByURL(relativeURL, options)
      .then(res => res.json())
      .then(json => keysToCamelCase(json))
      .then(json => {
        const rootPath = _.isUndefined(options.root) ? 'data' : options.root;
        return rootPath ? _.get(json, rootPath) : json;
      });
  }

  const fetchContacts = queryParams =>
    fetchDataByURL('/contacts', { queryParams, root: '' });
  const fetchContactsWithIds = contactIds =>
    Promise.all(_.map(contactIds, id => fetchContact(id)));
  const fetchContact = id => fetchDataByURL(`/contacts/${id}`);
  const fetchViewer = () => fetchDataByURL('/users/me');
  const fetchMessageLists = queryParams =>
    fetchDataByURL('/message_lists', { queryParams, root: '' });
  const fetchMessageList = id => fetchDataByURL(`/message_lists/${id}`);
  const fetchMessages = (contactId, queryParams) =>
    fetchDataByURL(`/contacts/${contactId}/messages`, {
      queryParams,
      root: '',
    });
  const fetchMessage = (contactId, id) =>
    fetchDataByURL(`/contacts/${contactId}/message/${id}`);

  const fetchCampaigns = queryParams =>
    fetchDataByURL('/campaigns', { queryParams, root: '' });
  const fetchCampaignsWithIds = campaignIds =>
    Promise.all(_.map(campaignIds, id => fetchCampaign(id)));
  const fetchCampaign = id => fetchDataByURL(`/campaigns/${id}`);

  function sendSMS(args) {
    const body = JSON.stringify({
      recipients: _.map(args.input.contactIds, globalId => {
        const { id } = fromGlobalId(globalId);
        return `contact-${id}`;
      }),
      message: {
        body: args.input.message,
      },
    });

    const fetchParams = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body,
    };
    return fetchResponseByURL('/messages', { fetchParams })
      .then(res => ({ success: res.ok }))
      .catch(error => {
        console.error(error);
        return { success: false };
      });
  }


  // Node queries

  const { nodeInterface, nodeField } = nodeDefinitions(
    globalId => {
      const { type, id } = fromGlobalId(globalId);
      if (type === 'Contact') {
        return fetchContact(id);
      }
      if (type === 'MessageList') {
        fetchMessageList(id);
      }
      if (type === 'Message') {
        fetchMessage(id);
      }
      if (type === 'Campaign') {
        fetchCampaign(id);
      }
    },
    object => {
      if (object.hasOwnProperty('contacts')) {
        return 'User';
      }
      if (object.hasOwnProperty('firstName')) {
        return 'Contact';
      }
      if (object.hasOwnProperty('messageListId')) {
        return 'MessageList';
      }
      if (object.hasOwnProperty('messageType')) {
        return 'Message';
      }
      if (object.hasOwnProperty('participantsCount')) {
        return 'Campaign';
      }
    },
  );


  // Types

  const MessageListScopeType = new GraphQLEnumType({
    name: 'MessageListScope',
    values: {
      INBOX: { value: 'inbox' },
      UNREAD: { value: 'unread' },
      STARRED: { value: 'starred' },
      SENT: { value: 'sent' },
    },
  });

  const MessageType = new GraphQLObjectType({
    name: 'Message',
    description: 'SMS Message',
    fields: () => ({
      id: globalIdField('Message'),
      authorName: { type: GraphQLString },
      authorAvatarUrl: { type: GraphQLString },
      deliveredAt: { type: GraphQLString },
      isRead: { type: GraphQLBoolean },
      isStarred: { type: GraphQLBoolean },
      human: { type: GraphQLBoolean },
      body: { type: GraphQLString },
      time: { type: GraphQLString },
      direction: { type: GraphQLString },
      messageType: { type: GraphQLString },
      author: {
        type: ContactType,
        resolve: (parent, args) => fetchContact(parent.authorId),
      },
    }),
  });

  const MessageListType = new GraphQLObjectType({
    name: 'MessageList',
    description: 'Message list (INBOX, UNREAD, STARRED, or SENT)',
    fields: () => ({
      id: globalIdField(
        'MessageList',
        (object, context, info) => object.messageListId,
      ),
      contact: {
        type: ContactType,
        resolve: (parent, args) => fetchContact(parent.id),
      },
      inboundMessageCount: { type: GraphQLInt },
      deliveredOutboundMessageCount: { type: GraphQLInt },
      mostRecentMessage: { type: MessageType },
    }),
  });

  const CampaignType = new GraphQLObjectType({
    name: 'Campaign',
    description: 'Skipio Campaign',
    fields: () => ({
      id: globalIdField('Campaign'),
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      status: { type: GraphQLString },
      contactsCount: { type: GraphQLInt },
      participantsCount: { type: GraphQLInt },
      contacts: {
        type: new GraphQLList(ContactType),
        resolve: (parent, args) => {
          return fetchContactsWithIds(_.keys(parent.contactIds));
        },
      },
    }),
  });

  const ContactType = new GraphQLObjectType({
    name: 'Contact',
    description: 'Skipio Contact',
    fields: () => ({
      id: globalIdField('Contact'),
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      fullName: { type: GraphQLString },
      sortName: { type: GraphQLString },
      phoneMobileNational: { type: GraphQLString },
      phoneMobileInternational: { type: GraphQLString },
      isSkipioPhoneNumber: { type: GraphQLBoolean },
      isStarred: { type: GraphQLBoolean },
      isUnread: { type: GraphQLBoolean },
      email: { type: GraphQLString },
      streetAddress: { type: GraphQLString },
      city: { type: GraphQLString },
      state: { type: GraphQLString },
      zipCode: { type: GraphQLString },
      avatarImageUrl: {
        type: GraphQLString,
        resolve: contact => contact.avatarUrl,
      },
      deliveredOutboundMessageCount: { type: GraphQLInt },
      inboundMessageCount: { type: GraphQLInt },
      campaignsCount: { type: GraphQLInt },
      campaigns: {
        type: new GraphQLList(CampaignType),
        resolve: (parent, args) =>
          fetchCampaignsWithIds(_.keys(parent.campaignIds)),
      },
      pagedMessages: {
        type: PagedMessagesType,
        args: {
          page: { type: GraphQLInt },
          per: { type: GraphQLInt },
        },
        resolve: (parent, args) => fetchMessages(parent.id, args),
      },
    }),
    interfaces: [nodeInterface],
  });

  const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'Skipio User',
    fields: () => ({
      id: globalIdField('User'),
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
      phoneMobile: { type: GraphQLString },
      skipioPhoneNumber: { type: GraphQLString },
      avatarImageUrl: { type: GraphQLString },
      maxCharacters: { type: GraphQLInt },
      unreadCount: { type: GraphQLInt },
      plan: { type: GraphQLString },
      pagedContacts: {
        type: PagedContactsType,
        args: {
          page: { type: GraphQLInt },
          per: { type: GraphQLInt },
          query: { type: GraphQLString },
        },
        resolve: (parent, args) => fetchContacts(args),
      },
      pagedMessageLists: {
        type: PagedMessageListsType,
        args: {
          page: { type: GraphQLInt },
          per: { type: GraphQLInt },
          scope: { type: new GraphQLNonNull(MessageListScopeType) },
          query: { type: GraphQLString },
        },
        resolve: (parent, args) => fetchMessageLists(args),
      },
      pagedCampaigns: {
        type: PagedCampaignsType,
        args: {
          page: { type: GraphQLInt },
          per: { type: GraphQLInt },
        },
        resolve: (parent, args) => fetchCampaigns(args),
      },
    }),
  });

  const MetaType = new GraphQLObjectType({
    name: 'Meta',
    description: 'Metadata about a list',
    fields: () => ({
      currentPage: { type: GraphQLInt },
      totalPages: { type: GraphQLInt },
      totalCount: { type: GraphQLInt },
      nextPage: { type: GraphQLInt },
      prevPage: { type: GraphQLInt },
    }),
  });

  const PagedCampaignsType = new GraphQLObjectType({
    name: 'PagedCampaigns',
    description: 'Campaign list with paging meta data',
    fields: () => ({
      meta: { type: MetaType },
      data: { type: new GraphQLList(CampaignType) },
    }),
  });

  const PagedContactsType = new GraphQLObjectType({
    name: 'PagedContacts',
    description: 'Contacts with paging meta data',
    fields: () => ({
      meta: { type: MetaType },
      data: { type: new GraphQLList(ContactType) },
    }),
  });

  const PagedMessageListsType = new GraphQLObjectType({
    name: 'PagedMessageLists',
    description: 'MessageLists with paging meta data',
    fields: () => ({
      meta: { type: MetaType },
      data: { type: new GraphQLList(MessageListType) },
    }),
  });

  const PagedMessagesType = new GraphQLObjectType({
    name: 'PagedMessages',
    description: 'Messages with paging meta data',
    fields: () => ({
      meta: { type: MetaType },
      data: { type: new GraphQLList(MessageType) },
    }),
  });

  const QueryRootType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
      node: nodeField,
      viewer: {
        type: UserType,
        resolve: (root, args) => fetchViewer(),
      },
    }),
  });


  // Mutations

  const SendSMSInputType = new GraphQLInputObjectType({
    name: 'SendSMSInputType',
    fields: () => ({
      contactIds: { type: new GraphQLNonNull(new GraphQLList(GraphQLID)) },
      message: { type: new GraphQLNonNull(GraphQLString) },
    }),
  });

  const SendSMSType = new GraphQLObjectType({
    name: 'SendSMSType',
    fields: () => ({
      success: { type: GraphQLBoolean },
    }),
  });

  const MutationRootType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
      sendSMS: {
        type: SendSMSType,
        args: {
          input: { type: new GraphQLNonNull(SendSMSInputType) },
        },
        resolve: (root, { input }) => sendSMS({ input }),
      },
    }),
  });

  return new GraphQLSchema({
    query: QueryRootType,
    mutation: MutationRootType,
  });
};

export default schemaForEnv;
