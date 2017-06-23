﻿using System;
using System.Collections.Generic;
using Umbraco.Core.Models.EntityBase;

namespace Umbraco.Core.Models.Membership
{
    /// <summary>
    /// Defines the interface for a <see cref="User"/>
    /// </summary>
    /// <remarks>Will be left internal until a proper Membership implementation is part of the roadmap</remarks>
    public interface IUser : IMembershipUser, IRememberBeingDirty, ICanBeDirty
    {
        UserState UserState { get; }

        string Name { get; set; }
        int SessionTimeout { get; set; }
        int[] StartContentIds { get; set; }
        int[] StartMediaIds { get; set; }
        string Language { get; set; }

        DateTime? EmailConfirmedDate { get; set; }
        DateTime? InvitedDate { get; set; }

        /// <summary>
        /// Gets the groups that user is part of
        /// </summary>
        IEnumerable<IReadOnlyUserGroup> Groups { get; }        

        void RemoveGroup(string group);
        void ClearGroups();
        void AddGroup(IReadOnlyUserGroup group);
        
        IEnumerable<string> AllowedSections { get; }

        /// <summary>
        /// Exposes the basic profile data
        /// </summary>
        IProfile ProfileData { get; }

        /// <summary>
        /// The security stamp used by ASP.Net identity
        /// </summary>
        string SecurityStamp { get; set; }

        /// <summary>
        /// Will hold the media file system relative path of the users custom avatar if they uploaded one
        /// </summary>
        string Avatar { get; set; }

        /// <summary>
        /// Returns all start node Ids assigned to the user based on both the explicit start node ids assigned to the user and any start node Ids assigned to it's user groups
        /// </summary>
        int[] AllStartContentIds { get; }

        /// <summary>
        /// Returns all start node Ids assigned to the user based on both the explicit start node ids assigned to the user and any start node Ids assigned to it's user groups
        /// </summary>
        int[] AllStartMediaIds { get; }
    }
}