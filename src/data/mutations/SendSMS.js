import {
  commitMutation,
  graphql,
} from 'react-relay';
import _ from 'lodash';

const mutation = graphql`
  mutation SendSMSMutation ($input: SendSMSInputType!) {
    sendSMS(input: $input) {
      success
    }
  }
`;

function sendSMS(environment, contactIds, message) {
  const variables = {
    input: {
      contactIds,
      message,
    },
  };

  return new Promise((resolve, reject) => {
    commitMutation(
      environment,
      {
        mutation,
        variables,
        onCompleted: (response, errors) => {
          const success = _.get(response, 'sendSMS.success', false);
          if (success) {
            resolve(response.sendSMS);
          }
          if (errors) {
            reject(errors);
          }
        },
        onError: error => reject(error),
      },
    );
  });
}

export default sendSMS;
