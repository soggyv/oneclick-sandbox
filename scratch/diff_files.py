import os
import difflib

dir_local = r"c:\Users\sogggyv\Desktop\OneClick"
dir_backup = r"c:\Users\sogggyv\Desktop\OneClick_Hetzner_Backup"

files_to_check = [
    "src/App.jsx",
    "src/index.css",
    "src/components/OrgRegisterModal.jsx",
    "src/components/ReviewsModal.jsx",
    "src/components/ShiftDetailsModal.jsx",
    "src/components/TimePickerModal.jsx",
    "src/components/Toast.jsx",
    "src/components/auth/AuthForm.jsx",
    "src/components/auth/OtpVerifyForm.jsx",
    "src/components/auth/ResetPasswordForm.jsx",
    "src/components/coordinator/CoordinatorProfile.jsx",
    "src/components/coordinator/CoordinatorShifts.jsx",
    "src/components/coordinator/EditShiftModal.jsx",
    "src/components/coordinator/ShiftCreateForm.jsx",
    "src/components/coordinator/Sidebar.jsx",
    "src/components/shared/Navigation.jsx",
    "src/components/volunteer/BookedShiftsList.jsx",
    "src/components/volunteer/CalendarSelector.jsx",
    "src/components/volunteer/SphereFilters.jsx",
    "src/components/volunteer/VolunteerDashboard.jsx",
    "src/components/volunteer/VolunteerProfile.jsx",
    "src/store/useStore.js"
]

def show_diff(file_rel_path):
    path_local = os.path.join(dir_local, file_rel_path)
    path_backup = os.path.join(dir_backup, file_rel_path)
    
    if not os.path.exists(path_backup):
        print(f"Only in local: {file_rel_path}")
        return
        
    with open(path_local, 'r', encoding='utf-8', errors='ignore') as f1:
        lines_local = f1.readlines()
    with open(path_backup, 'r', encoding='utf-8', errors='ignore') as f2:
        lines_backup = f2.readlines()
        
    diff = list(difflib.unified_diff(
        lines_backup, lines_local,
        fromfile=f"backup/{file_rel_path}",
        tofile=f"local/{file_rel_path}",
        n=2
    ))
    
    if diff:
        # Check if the diff contains changes that are NOT additions of dark: classes or dark mode support.
        # Let's count how many lines are added/removed
        added = [line for line in diff if line.startswith('+') and not line.startswith('+++')]
        removed = [line for line in diff if line.startswith('-') and not line.startswith('---')]
        print(f"\nDiff for {file_rel_path}: {len(added)} lines added, {len(removed)} lines removed in local")
        
        # Print a small sample of the diff to see if there are other changes
        for line in diff[:15]:
            print(line.rstrip())
        if len(diff) > 15:
            print("...")

for f in files_to_check:
    show_diff(f)
