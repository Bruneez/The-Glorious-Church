// profile-global.js
(function() {
    let globalAuthUser = null;
    let globalStaffDocId = null;
    let globalUploadedPhotoBase64 = "";

    // Run session initialization loops
    window.addEventListener('DOMContentLoaded', () => {
        initProfileGlobalSession();
    });

    // Fallback export if sub-pages manually invoke verification sequences
    window.listenToAuthSession = function() {
        initProfileGlobalSession();
    };

    function initProfileGlobalSession() {
        if (!firebase.apps.length) return;
        
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                globalAuthUser = user;
                // Fetch details from Firestore staff collection
                firebase.firestore().collection('staff')
                    .where('email', '==', user.email)
                    .get()
                    .then(snapshot => {
                        if (!snapshot.empty) {
                            const doc = snapshot.docs[0];
                            globalStaffDocId = doc.id;
                            const data = doc.data();
                            
                            updateSidebarProfileUI(data.name, user.email, data.photo);
                            patchDropdownMenuLayout(data.name, user.email);
                        }
                    })
                    .catch(err => console.error("Global profile tracking error:", err));
            }
        });

        // Global Event delegation for intercepting clicks seamlessly across page injections
        document.removeEventListener('click', handleGlobalProfileClicks);
        document.addEventListener('click', handleGlobalProfileClicks);
    }

    function updateSidebarProfileUI(name, email, photoUrl) {
        // Find existing text placeholders inside your loaded sidebar
        const sidebarButtons = document.querySelectorAll('#profile-menu-button');
        sidebarButtons.forEach(btn => {
            const nameEl = btn.querySelector('p.font-bold, span.font-bold, .text-white');
            if (nameEl) nameEl.textContent = name || "Staff Member";
            
            // If there's an avatar wrapper, populate it
            const imgEl = btn.querySelector('img');
            if (imgEl && photoUrl) {
                imgEl.src = photoUrl;
            } else if (photoUrl) {
                const avatarContainer = btn.querySelector('div.rounded-full');
                if (avatarContainer) {
                    avatarContainer.innerHTML = `<img src="${photoUrl}" class="w-full h-full object-cover rounded-full">`;
                }
            }
        });
    }

    function patchDropdownMenuLayout(name, email) {
        const dropMenu = document.getElementById("profile-dropdown-menu");
        if (!dropMenu) return;

        // Rewrite container inner structural design to enforce the exact rule specifications
        dropMenu.className = "hidden absolute left-4 bottom-16 w-60 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl space-y-2 z-50 text-xs text-slate-300";
        dropMenu.innerHTML = `
            <div class="border-b border-slate-700/60 pb-2 mb-1">
                <p class="font-bold text-white truncate text-[11px]">${name || 'Staff Member'}</p>
                <p class="text-[10px] text-slate-400 font-mono truncate">${email}</p>
            </div>
            <button id="trigger-account-settings" class="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition cursor-pointer font-medium">
                <i data-lucide="settings" class="w-3.5 h-3.5"></i> Account Settings
            </button>
            <button id="trigger-global-signout" class="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition cursor-pointer font-medium">
                <i data-lucide="log-out" class="w-3.5 h-3.5"></i> Sign Out
            </button>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function handleGlobalProfileClicks(e) {
        const profileBtn = e.target.closest('#profile-menu-button');
        const dropMenu = document.getElementById("profile-dropdown-menu");
        
        if (profileBtn) {
            e.preventDefault();
            e.stopPropagation();
            if (dropMenu) dropMenu.classList.toggle("hidden");
            return;
        }

        // Catch Account Settings Click
        if (e.target.closest('#trigger-account-settings')) {
            if (dropMenu) dropMenu.classList.add("hidden");
            openAccountSettingsModal();
            return;
        }

        // Catch Sign Out Click
        if (e.target.closest('#trigger-global-signout')) {
            if (confirm("Are you sure you want to log out?")) {
                firebase.auth().signOut().then(() => {
                    window.location.href = "login.html";
                });
            }
            return;
        }

        // Auto hide dropdown on blank target click
        if (dropMenu && !dropMenu.contains(e.target)) {
            dropMenu.classList.add("hidden");
        }
    }

    function openAccountSettingsModal() {
        // Prevent duplicate injections
        let modal = document.getElementById('global-account-settings-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'global-account-settings-modal';
        modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs";
        
        // Setup working template markup loading user instance details dynamically
        modal.innerHTML = `
            <div class="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-sm shadow-xl p-4 space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center border-b border-slate-700 pb-2">
                    <h3 class="font-bold text-white text-sm flex items-center gap-1.5">
                        <i data-lucide="user-cog" class="text-indigo-400"></i> Account Settings
                    </h3>
                    <button id="close-settings-modal" class="text-slate-400 hover:text-white cursor-pointer">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <form id="global-settings-form" class="space-y-3">
                    <div>
                        <label class="block text-slate-400 mb-1">Update Profile Picture</label>
                        <div class="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
                            <div id="settings-avatar-preview" class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                <i data-lucide="user" class="w-5 h-5 text-slate-500"></i>
                            </div>
                            <input type="file" id="settings-file-input" accept="image/*" class="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:cursor-pointer">
                        </div>
                    </div>

                    <div>
                        <label class="block text-slate-400 mb-0.5">Full Name</label>
                        <input type="text" id="settings-display-name" required class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none">
                    </div>

                    <div class="pt-2 border-t border-slate-700/60">
                        <p class="text-indigo-400 font-semibold mb-2">Change Account Password (Optional)</p>
                        <div class="space-y-2">
                            <div>
                                <label class="block text-slate-400 mb-0.5">New Password</label>
                                <input type="password" id="settings-new-password" placeholder="Leave blank to keep current" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none">
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-2 border-t border-slate-700">
                        <button type="button" id="close-settings-modal-btn" class="bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">Cancel</button>
                        <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer transition">Save Updates</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Hydrate data into inputs
        if (globalStaffDocId) {
            firebase.firestore().collection('staff').doc(globalStaffDocId).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('settings-display-name').value = data.name || "";
                    if (data.photo) {
                        globalUploadedPhotoBase64 = data.photo;
                        document.getElementById('settings-avatar-preview').innerHTML = `<img src="${data.photo}" class="w-full h-full object-cover rounded-full">`;
                    }
                }
            });
        }

        // Wire modal closing buttons
        const closeBtn = () => modal.remove();
        document.getElementById('close-settings-modal').onclick = closeBtn;
        document.getElementById('close-settings-modal-btn').onclick = closeBtn;

        // Track local photo conversion stream
        document.getElementById('settings-file-input').onchange = function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                globalUploadedPhotoBase64 = e.target.result;
                document.getElementById('settings-avatar-preview').innerHTML = `<img src="${globalUploadedPhotoBase64}" class="w-full h-full object-cover rounded-full">`;
            };
            reader.readAsDataURL(file);
        };

        // Form Submission Management Action Pipeline
        document.getElementById('global-settings-form').onsubmit = function(e) {
            e.preventDefault();
            const updatedName = document.getElementById('settings-display-name').value.trim();
            const newPassword = document.getElementById('settings-new-password').value;

            if (!globalStaffDocId || !globalAuthUser) {
                alert("Session not verified.");
                return;
            }

            const batchUpdates = [];
            
            // 1. Update Profile in Firestore
            const firestorePromise = firebase.firestore().collection('staff').doc(globalStaffDocId).update({
                name: updatedName,
                photo: globalUploadedPhotoBase64
            });
            batchUpdates.push(firestorePromise);

            // 2. Handle Password update optional process stream
            if (newPassword.trim() !== "") {
                if (newPassword.length < 6) {
                    alert("Password must be at least 6 characters long.");
                    return;
                }
                batchUpdates.push(globalAuthUser.updatePassword(newPassword));
            }

            Promise.all(batchUpdates)
                .then(() => {
                    alert("Account profile settings updated successfully!");
                    modal.remove();
                    // Live refresh of layout references
                    updateSidebarProfileUI(updatedName, globalAuthUser.email, globalUploadedPhotoBase64);
                    patchDropdownMenuLayout(updatedName, globalAuthUser.email);
                })
                .catch(err => {
                    console.error(err);
                    alert("Error saving updates: " + err.message);
                });
        };
    }
})();