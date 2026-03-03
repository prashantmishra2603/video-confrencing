import React, { useState } from 'react';

const ContactList = ({ 
  contacts, 
  onStartCall, 
  onStartChat,
  title = "Contacts"
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <span>👥</span>
          {title}
        </h3>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-dark-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900 text-dark-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-dark-500 border border-dark-700"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
            🔍
          </span>
        </div>
      </div>

      {/* Contact List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">😔</div>
            <p className="text-dark-400 text-sm">
              {searchTerm ? 'No contacts found' : 'No contacts online'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className="p-3 hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.username}`}
                      alt={contact.displayName}
                      className="w-12 h-12 rounded-full border-2 border-dark-600"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-dark-800"></div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-dark-100 font-medium truncate">
                      {contact.displayName || contact.username}
                    </h4>
                    <p className="text-dark-500 text-xs truncate">
                      @{contact.username}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* Chat Button */}
                    <button
                      onClick={() => onStartChat(contact)}
                      className="w-9 h-9 rounded-full bg-dark-700 hover:bg-primary-600 flex items-center justify-center transition-colors"
                      title="Send message"
                    >
                      💬
                    </button>
                    {/* Call Button */}
                    <button
                      onClick={() => onStartCall(contact)}
                      className="w-9 h-9 rounded-full bg-dark-700 hover:bg-green-600 flex items-center justify-center transition-colors"
                      title="Start video call"
                    >
                      📹
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
