import Moment from 'moment';

const initialState = {
  subjectName: '',
  branchId: 0,
  instituteId: 0,
  topic: '',
  meetingDate: Moment(new Date()).toDate(),
  meetingTime: Moment(new Date()).toDate(),
  PresenterName: '',
  meetingId: 0,
  MeetingProviderId: 0,
  password: '',
  duration: 0,
  isActive: 0,
  StatusFlag: 0,
  isMute: false,
  isEdit: false,
  classProviderId: 0,
  EnableApprovalonInviteLink: 'OFF',
  IsHostVideo: 'OFF',
  IsVideoParticipant: 'OFF',
  MuteParticipantOnEntry: 'OFF',
  EnableWaitingRoom: 'OFF',
  IsVideoRecording: 'OFF',
  ExtendDuration: 'OFF',
  isSendNotification: 'OFF',
  DefaultAttendeeAudio: 'OFF',
  DefaultAttendeeWritting: 'OFF',

  VirtualSettingId: 0,
  autoClassId: 0,
  autoSectionId: 0,
  presenterId: 0,
  sectionName: "",
  isParentMeeting: 0
};

//Reducers
export default VirtualClassReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_CLASS_DATA':
      return {
        ...state,
        subjectName: action.payload.subjectName,
        branchId: action.payload.branchId,
        instituteId: action.payload.instituteId,
        topic: action.payload.topic,
        meetingDate: action.payload.meetingDate,
        meetingTime: action.payload.meetingTime,
        PresenterName: action.payload.PresenterName,
        meetingId: action.payload.meetingId,
        MeetingProviderId: action.payload.MeetingProviderId,
        password: action.payload.password,
        duration: action.payload.duration,
        isActive: action.payload.isActive,
        StatusFlag: action.payload.StatusFlag,
        isMute: action.payload.isMute,
        isEdit: action.payload.isEdit,
        classProviderId: action.payload.classProviderId,
        EnableApprovalonInviteLink: action.payload.EnableApprovalonInviteLink,
        IsHostVideo: action.payload.IsHostVideo,
        IsVideoParticipant: action.payload.IsVideoParticipant,
        MuteParticipantOnEntry: action.payload.MuteParticipantOnEntry,
        EnableWaitingRoom: action.payload.EnableWaitingRoom,
        IsVideoRecording: action.payload.IsVideoRecording,
        ExtendDuration: action.payload.ExtendDuration,
        DefaultAttendeeAudio: action.payload.DefaultAttendeeAudio,
        DefaultAttendeeWritting: action.payload.DefaultAttendeeWritting,
        VirtualSettingId: action.payload.VirtualSettingId,
        autoClassId: action.payload.autoClassId,
        autoSectionId: action.payload.autoSectionId,
        presenterId: action.payload.presenterId,
        sectionName: action.payload.sectionName,
        isParentMeeting: action.payload.isParentMeeting

      };

    case 'DELETE_CLASS_DATA':
      return {
        ...state,
        subjectName: undefined,
        branchId: undefined,
        instituteId: undefined,
        topic: undefined,
        meetingDate: undefined,
        meetingTime: undefined,
        PresenterName: undefined,
        meetingId: undefined,
        MeetingProviderId: undefined,
        password: undefined,
        duration: undefined,
        isActive: undefined,
        StatusFlag: undefined,
        isMute: undefined,
        isEdit: undefined,
        classProviderId: undefined,
        EnableApprovalonInviteLink: undefined,
        IsHostVideo: undefined,
        IsVideoParticipant: undefined,
        MuteParticipantOnEntry: undefined,
        EnableWaitingRoom: undefined,
        IsVideoRecording: undefined,
        ExtendDuration: undefined,
        DefaultAttendeeAudio: undefined,
        DefaultAttendeeWritting: undefined,
        VirtualSettingId: undefined,
        autoClassId: undefined,
        autoSectionId: undefined,
        presenterId: undefined,
        sectionName: undefined,
        isParentMeeting: undefined

      };
    default:
      return state;
  }
};


//Action of Reducers
export const ActionAddVirtualClass = (data) => {
  return {
    type: 'ADD_CLASS_DATA',
    payload: data
  };
};
export const ActionDeleteVirtualClass = () => {
  return {
    type: 'DELETE_CLASS_DATA',
  };
};