
const initialState = {
  msgID: '0', subjectName: '',
  messageObj: {}, isRead: 0,
};

export default MessageInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE_INFO':
      return { ...state,
        msgID: action.payload.msgID, subjectName: action.payload.subjectName,
        messageObj: action.payload.messageObj, isRead: action.payload.isRead,        
      };
    case 'DELETE_MESSAGE_INFO':
      return { ...state,
        msgID: '0', subjectName: '', messageObj: {}, isRead: 0,
      };
      case 'UPDATE_UNREAD_MSG_CNT':
        return { ...state,
          unreadMsg: action.payload.unreadMsg < 0 ? 0 : action.payload.unreadMsg,
        };
    default:
      return state;
  }
};

export const ActionAddMessage = (data) => {
  return {
    type: 'ADD_MESSAGE_INFO',
    payload: data
  };
};

export const ActionUpdateMessage = (data) => {
  return {
    type: 'UPDATE_UNREAD_MSG_CNT',
    payload: data
  };
};

export const ActionDeleteMessage = () => {
  return {
    type: 'DELETE_MESSAGE_INFO',    
  };
};