const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Omnichannel Messaging System (Respond.io Features)
const conversations = [];
const messages = [];
const contacts = [];
const automations = [];
const templates = [];
const channels = ['whatsapp', 'instagram', 'facebook', 'sms', 'email', 'webchat'];

// Unified Inbox Management
const createConversation = (req, res) => {
  const { contactId, channel, source, assignedTo } = req.body;
  
  const conversation = {
    id: uuidv4(),
    contactId,
    channel, // whatsapp, instagram, facebook, sms, email
    source,
    assignedTo, // staff member ID
    status: 'open', // open, pending, closed
    priority: 'normal', // low, normal, high, urgent
    tags: [],
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    messageCount: 0,
    isLead: false,
    leadScore: 0
  };
  
  conversations.push(conversation);
  res.status(201).json({ conversation });
};

// Send Message
const sendMessage = (req, res) => {
  const { conversationId, senderId, content, type, templateId } = req.body;
  
  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  const message = {
    id: uuidv4(),
    conversationId,
    senderId,
    content,
    type, // text, image, video, document, template, quick_reply
    templateId,
    timestamp: new Date().toISOString(),
    status: 'sent', // sent, delivered, read, failed
    direction: 'outbound' // inbound, outbound
  };
  
  messages.push(message);
  
  // Update conversation
  conversation.lastMessageAt = message.timestamp;
  conversation.messageCount++;
  
  // Auto-detect lead intent
  if (isLeadMessage(content)) {
    conversation.isLead = true;
    conversation.leadScore = calculateLeadScore(conversationId);
  }
  
  res.status(201).json({ message });
};

// Receive Message (Webhook)
const receiveMessage = (req, res) => {
  const { conversationId, senderId, content, channel, metadata } = req.body;
  
  let conversation = conversations.find(c => c.id === conversationId);
  
  // Create conversation if doesn't exist
  if (!conversation) {
    conversation = {
      id: conversationId || uuidv4(),
      contactId: senderId,
      channel,
      source: 'inbound',
      assignedTo: null,
      status: 'open',
      priority: 'normal',
      tags: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messageCount: 0,
      isLead: false,
      leadScore: 0
    };
    conversations.push(conversation);
  }
  
  const message = {
    id: uuidv4(),
    conversationId: conversation.id,
    senderId,
    content,
    type: 'text',
    timestamp: new Date().toISOString(),
    status: 'received',
    direction: 'inbound',
    metadata
  };
  
  messages.push(message);
  
  // Update conversation
  conversation.lastMessageAt = message.timestamp;
  conversation.messageCount++;
  
  // Auto-assign based on rules
  autoAssignConversation(conversation);
  
  // Trigger automations
  triggerAutomations(conversation, message);
  
  res.status(201).json({ message, conversation });
};

// Contact Management
const createContact = (req, res) => {
  const { name, phone, email, channel, tags, customFields } = req.body;
  
  const contact = {
    id: uuidv4(),
    name,
    phone,
    email,
    channels: [channel],
    tags: tags || [],
    customFields: customFields || {},
    createdAt: new Date().toISOString(),
    lastContactAt: new Date().toISOString(),
    conversationCount: 0,
    isLead: false,
    leadScore: 0,
    membershipStatus: 'prospect' // prospect, member, expired, cancelled
  };
  
  contacts.push(contact);
  res.status(201).json({ contact });
};

// Message Templates
const createTemplate = (req, res) => {
  const { name, content, category, language, variables } = req.body;
  
  const template = {
    id: uuidv4(),
    name,
    content,
    category, // marketing, utility, authentication
    language: language || 'en',
    variables: variables || [],
    status: 'pending', // pending, approved, rejected
    createdAt: new Date().toISOString(),
    usageCount: 0
  };
  
  templates.push(template);
  res.status(201).json({ template });
};

// Automation Workflows
const createAutomation = (req, res) => {
  const { name, trigger, conditions, actions, isActive } = req.body;
  
  const automation = {
    id: uuidv4(),
    name,
    trigger, // message_received, keyword_detected, lead_scored, time_based
    conditions,
    actions, // send_message, assign_agent, add_tag, create_lead
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
    executionCount: 0
  };
  
  automations.push(automation);
  res.status(201).json({ automation });
};

// Lead Scoring
const calculateLeadScore = (conversationId) => {
  const conversationMessages = messages.filter(m => m.conversationId === conversationId);
  let score = 0;
  
  const leadKeywords = [
    'membership', 'price', 'cost', 'join', 'sign up', 'register',
    'trial', 'free', 'discount', 'offer', 'class', 'trainer',
    'gym', 'fitness', 'workout', 'schedule', 'timing'
  ];
  
  conversationMessages.forEach(message => {
    leadKeywords.forEach(keyword => {
      if (message.content.toLowerCase().includes(keyword)) {
        score += 10;
      }
    });
    
    // Engagement scoring
    if (message.direction === 'inbound') score += 5;
    if (message.type === 'image' || message.type === 'video') score += 15;
  });
  
  // Time-based scoring
  const conversation = conversations.find(c => c.id === conversationId);
  const hoursSinceStart = moment().diff(conversation.createdAt, 'hours');
  if (hoursSinceStart < 24) score += 20; // Recent engagement
  
  return Math.min(score, 100); // Cap at 100
};

// Auto-assignment Rules
const autoAssignConversation = (conversation) => {
  // Simple round-robin assignment
  const availableAgents = ['agent1', 'agent2', 'agent3']; // Replace with actual staff IDs
  const assignedConversations = conversations.filter(c => c.assignedTo);
  const agentWorkload = {};
  
  availableAgents.forEach(agent => {
    agentWorkload[agent] = assignedConversations.filter(c => c.assignedTo === agent).length;
  });
  
  // Assign to agent with least workload
  const leastBusyAgent = Object.keys(agentWorkload).reduce((a, b) => 
    agentWorkload[a] < agentWorkload[b] ? a : b
  );
  
  conversation.assignedTo = leastBusyAgent;
};

// Trigger Automations
const triggerAutomations = (conversation, message) => {
  const activeAutomations = automations.filter(a => a.isActive);
  
  activeAutomations.forEach(automation => {
    let shouldExecute = false;
    
    switch (automation.trigger) {
      case 'message_received':
        shouldExecute = message.direction === 'inbound';
        break;
      case 'keyword_detected':
        shouldExecute = automation.conditions.keywords.some(keyword =>
          message.content.toLowerCase().includes(keyword.toLowerCase())
        );
        break;
      case 'lead_scored':
        shouldExecute = conversation.leadScore >= automation.conditions.minScore;
        break;
    }
    
    if (shouldExecute) {
      executeAutomation(automation, conversation, message);
    }
  });
};

// Execute Automation Actions
const executeAutomation = (automation, conversation, message) => {
  automation.actions.forEach(action => {
    switch (action.type) {
      case 'send_message':
        const autoMessage = {
          id: uuidv4(),
          conversationId: conversation.id,
          senderId: 'system',
          content: action.content,
          type: 'text',
          timestamp: new Date().toISOString(),
          status: 'sent',
          direction: 'outbound'
        };
        messages.push(autoMessage);
        break;
        
      case 'assign_agent':
        conversation.assignedTo = action.agentId;
        break;
        
      case 'add_tag':
        if (!conversation.tags.includes(action.tag)) {
          conversation.tags.push(action.tag);
        }
        break;
        
      case 'create_lead':
        // Create lead in CRM
        const lead = {
          id: uuidv4(),
          name: message.senderId,
          source: conversation.channel,
          status: 'new',
          conversationId: conversation.id,
          createdAt: new Date().toISOString()
        };
        leads.push(lead);
        break;
    }
  });
  
  automation.executionCount++;
};

// Analytics Dashboard
const getMessagingAnalytics = (req, res) => {
  const { startDate, endDate } = req.query;
  
  const filteredConversations = conversations.filter(c => {
    const created = moment(c.createdAt);
    return created.isBetween(startDate, endDate, null, '[]');
  });
  
  const analytics = {
    totalConversations: filteredConversations.length,
    activeConversations: filteredConversations.filter(c => c.status === 'open').length,
    leadsGenerated: filteredConversations.filter(c => c.isLead).length,
    averageResponseTime: calculateAverageResponseTime(),
    channelBreakdown: getChannelBreakdown(filteredConversations),
    agentPerformance: getAgentPerformance(),
    conversionRate: calculateConversionRate(filteredConversations)
  };
  
  res.json({ analytics });
};

// Helper Functions
const isLeadMessage = (content) => {
  const leadKeywords = [
    'membership', 'price', 'cost', 'join', 'sign up', 'register',
    'trial', 'free', 'discount', 'offer', 'class', 'trainer'
  ];
  
  return leadKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
};

const calculateAverageResponseTime = () => {
  // Calculate average time between inbound and outbound messages
  return '2.5 minutes'; // Placeholder
};

const getChannelBreakdown = (conversations) => {
  const breakdown = {};
  channels.forEach(channel => {
    breakdown[channel] = conversations.filter(c => c.channel === channel).length;
  });
  return breakdown;
};

const getAgentPerformance = () => {
  return {
    totalAgents: 5,
    activeAgents: 3,
    averageHandlingTime: '8.5 minutes',
    customerSatisfaction: 4.2
  };
};

const calculateConversionRate = (conversations) => {
  const leads = conversations.filter(c => c.isLead).length;
  const conversions = leads * 0.15; // 15% conversion rate
  return {
    leads,
    conversions: Math.round(conversions),
    rate: '15%'
  };
};

module.exports = {
  createConversation,
  sendMessage,
  receiveMessage,
  createContact,
  createTemplate,
  createAutomation,
  getMessagingAnalytics,
  conversations,
  messages,
  contacts,
  templates,
  automations
};