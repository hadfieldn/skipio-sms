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
import {
  globalIdField,
  fromGlobalId,
  nodeDefinitions,
} from 'graphql-relay';
import DataLoader from 'dataloader';
import _ from 'lodash';
import qs from 'qs';
import keysToCamelCase from './keysToCamelCase';

const schemaForEnv = (env) => {
  // {{base_url}}/api/{{version}}/users/me?token={{token}}
  const BASE_URL = `${env.BACKEND_DOMAIN}/api/${env.API_VERSION}`;

  function fetchResponseByURL(relativeURL, options = {}) {
    const queryParams = options.queryParams || {};
    const fetchParams = options.fetchParams || {};
    const query = qs.stringify({...queryParams, token: env.API_TOKEN});
    return fetch(`${BASE_URL}${relativeURL}?${query}`, fetchParams)
  }

  function fetchDataByURL(relativeURL, options) {
    return fetchResponseByURL(relativeURL, options)
      .then(res => res.json())
      .then(json => keysToCamelCase(json))
      .then(json => { console.log({json}); return json.data; });
  }

  const fetchContacts = queryParams => fetchDataByURL('/contacts', { queryParams });
  const fetchContact = id => { console.log({ id }); return fetchDataByURL(`/contacts/${id}`) };
  const fetchViewer = () => fetchDataByURL('/users/me');
  const fetchMessageLists = queryParams => fetchDataByURL('/message_lists', { queryParams });
  const fetchMessageList = id => fetchDataByURL(`/message_lists/${id}`);
  // const fetchMessages = (contactId, queryParams) => fetchDataByURL(`/contacts/${contactId}/messages`, { queryParams });
  const fetchMessage = (contactId, id) => fetchDataByURL(`/contacts/${contactId}/message/${id}`);

  const fetchCampaigns = campaignIds => Promise.all(_.map(campaignIds, id => fetchCampaign(id)));
  const fetchCampaign = id => fetchDataByURL(`/campaigns/${id}`);

  function sendSMS(args) {
    const body = JSON.stringify({
      recipients: _.map(args.input.contactIds, globalId => {
        const { id } = fromGlobalId(globalId);
        return `contact-${id}`
      }),
      message: {
        body: args.input.message
      }
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
        return ({ success: false });
      });
  }

  const { nodeInterface, nodeField } = nodeDefinitions(
    globalId => {
      const { type, id } = fromGlobalId(globalId);
      if (type === 'Contact') {
        return new DataLoader(ids => Promise.all(_.map(ids, fetchContact)));
      }
      if (type === 'MessageList') {
        return new DataLoader(ids => Promise.all(_.map(ids, fetchMessageList)));
      }
      if (type === 'Message') {
        return new DataLoader(ids => Promise.all(_.map(ids, fetchMessage)));
      }
      if (type === 'Campaign') {
        return new DataLoader(ids => Promise.all(_.map(ids, fetchCampaign)));
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

  const MessageListScopeType = new GraphQLEnumType({
    name: 'MessageListScope',
    values: {
      INBOX: { value: 'inbox' },
      UNREAD: { value: 'unread' },
      STARRED: { value: 'starred' },
      SENT: { value: 'sent' },
    }
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
      id: globalIdField('MessageList', (object, context, info) => object.messageListId),
      contact: {
        type: ContactType,
        resolve: (parent, args) => fetchContact(parent.id),
      },
      inboundMessageCount: { type: GraphQLInt },
      deliveredOutboundMessageCount: { type: GraphQLInt },
      mostRecentMessage: { type: MessageType },
    }),
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
      contacts: {
        type: new GraphQLList(ContactType),
        args: {
          page: { type: GraphQLInt },
          per: { type: GraphQLInt },
          query: { type: GraphQLString }
        },
        resolve: (parent, args) => fetchContacts(args),
      },
      messageLists: {
        type: new GraphQLList(MessageListType),
        args: {
          page: { type: GraphQLInt },
          per: { type: GraphQLInt },
          scope: { type: new GraphQLNonNull(MessageListScopeType) },
          query: { type: GraphQLString },
        },
        resolve: (parent, args) => fetchMessageLists(args),
      },
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
      contactIds: {
        type: new GraphQLList(GraphQLString),
        resolve: (parent, args) => { console.log('contactIds', { parent, args }); return parent.contactIds; },
      },
      contacts: {
        type: new GraphQLList(ContactType),
        resolve: (parent, args) => { console.log({ parent }); return Promise.all(_.map(parent.contactIds, id => fetchContact(id))); },
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
      zipCode: { type: GraphQLString },
      state: { type: GraphQLString },
      avatarImageUrl: {
        type: GraphQLString,
        resolve: contact => contact.avatarUrl,
      },
      deliveredOutboundMessageCount: { type: GraphQLInt },
      inboundMessageCount: { type: GraphQLInt },
      campaignsCount: { type: GraphQLInt },
      campaigns: {
        type: new GraphQLList(CampaignType),
        resolve: (parent, args) => fetchCampaigns(_.keys(parent.campaignIds))
      },
    }),
    interfaces: [ nodeInterface ],
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
      success: { type: GraphQLBoolean }
    }),
  });

  const MutationRootType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
      sendSMS: {
        type: SendSMSType,
        args: {
          input: { type: new GraphQLNonNull(SendSMSInputType) }
        },
        resolve: (root, { input }) => sendSMS({ input })
      }
    }),
  });

  return new GraphQLSchema({
    query: QueryRootType,
    mutation: MutationRootType,
  })
};

export default schemaForEnv;