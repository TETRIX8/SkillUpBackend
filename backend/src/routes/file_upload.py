from flask import Blueprint, request, jsonify, send_from_directory, current_app
from src.models import db, Submission, User, Assignment
from src.utils.jwt_utils import token_required, student_required, teacher_required
import os
import uuid
from werkzeug.utils import secure_filename

file_upload_bp = Blueprint('file_upload', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'}

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@file_upload_bp.route('/upload', methods=['POST'])
@token_required
@student_required
def upload_file(current_user):
    """Upload file for assignment submission"""
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    
    file = request.files['file']
    assignment_id = request.form.get('assignment_id')
    
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if not assignment_id:
        return jsonify({'message': 'Assignment ID is required'}), 400
    
    # Check if assignment exists
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({'message': 'Assignment not found'}), 404
    
    if file and allowed_file(file.filename):
        # Secure the filename and generate unique name
        original_filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4()) + '_' + original_filename
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        try:
            file.save(file_path)
            
            return jsonify({
                'message': 'File uploaded successfully',
                'file_path': unique_filename,
                'file_name': original_filename,
                'assignment_id': assignment_id
            }), 200
        except Exception as e:
            return jsonify({'message': f'File upload failed: {str(e)}'}), 500
    else:
        return jsonify({'message': 'File type not allowed'}), 400

@file_upload_bp.route('/download/<filename>', methods=['GET'])
@token_required
def download_file(current_user, filename):
    """Download file with access control"""
    # Basic security check: prevent directory traversal
    if ".." in filename or filename.startswith('/'):
        return jsonify({'message': 'Invalid filename'}), 400

    file_full_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_full_path):
        return jsonify({'message': 'File not found'}), 404
    
    # Find submission with this file
    submission = Submission.query.filter_by(file_path=filename).first()
    if not submission:
        return jsonify({'message': 'File not associated with any submission'}), 404
    
    # Check access permissions
    if current_user.is_student():
        # Students can only download their own files
        if submission.student_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
    elif current_user.is_teacher() and not current_user.is_admin():
        # Teachers can download files from their assignments
        if submission.assignment.topic.teacher_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
    # Admins can download any file
    
    # Use original filename for download
    download_name = submission.file_name if submission.file_name else filename
    
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True, download_name=download_name)

@file_upload_bp.route('/submissions/<int:submission_id>/files', methods=['GET'])
@token_required
def get_submission_files(current_user, submission_id):
    """Get files associated with a submission"""
    submission = Submission.query.get(submission_id)
    if not submission:
        return jsonify({'message': 'Submission not found'}), 404
    
    # Check access permissions
    if current_user.is_student():
        if submission.student_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
    elif current_user.is_teacher() and not current_user.is_admin():
        if submission.assignment.topic.teacher_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
    
    files = []
    if submission.file_path:
        files.append({
            'file_path': submission.file_path,
            'file_name': submission.file_name or submission.file_path,
            'download_url': f'/api/files/download/{submission.file_path}'
        })
    
    return jsonify({'files': files}), 200



