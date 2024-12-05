import os
import re
import pandas as pd
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import time
from io import BytesIO, StringIO

app = Flask(__name__)
CORS(app)

# Define the regex pattern to parse the log file entries
log_pattern = re.compile(
    r'(?P<ip>\S+) - - \[(?P<datetime>[^\]]+)\] "(?P<method>\S+) (?P<endpoint>\S+) \S+" (?P<status>\d+) (?P<size>\d+)(?: "(?P<message>[^"]+)")?'
)

def process_log_file(log_file_path, suspicious_threshold=10):
    # Parse the log file and save it to a DataFrame
    timer_start = time.time()

    with open(log_file_path, 'r') as log_file:
        rows = []
        for line in log_file:
            match = log_pattern.match(line)
            if match:
                row = [
                    match.group("ip"),
                    match.group("datetime"),
                    match.group("method"),
                    match.group("endpoint"),
                    int(match.group("status")),
                    int(match.group("size")),
                    match.group("message") or ""
                ]
                rows.append(row)

    # Convert the rows to DataFrame
    df = pd.DataFrame(rows, columns=["IP Address", "Datetime", "Method", "Endpoint", "Status", "Size", "Message"])

    # Count Requests per IP Address
    ip_counts = df['IP Address'].value_counts()

    # Sort IP counts by request count in descending order
    sorted_ip_counts = sorted(ip_counts.items(), key=lambda item: (-item[1], item[0]))

    # Identify the Most Frequently Accessed Endpoint
    endpoint_counts = df['Endpoint'].value_counts()
    most_accessed_endpoint = None
    most_accessed_count = 0

    if not endpoint_counts.empty:
        most_accessed_endpoint = endpoint_counts.index[0]
        most_accessed_count = int(endpoint_counts.iloc[0])  # Convert to native Python int

    # Detect Suspicious Activity (Failed Logins)
    failed_logins = df[(df['Status'] == 401) | (df['Message'].str.contains('Invalid credentials', na=False))]
    failed_login_counts = failed_logins['IP Address'].value_counts()
    suspicious_ips = failed_login_counts[failed_login_counts > suspicious_threshold]
    sorted_suspicious_ips = sorted(suspicious_ips.items(), key=lambda item: (-item[1], item[0]))

    timer_end = time.time()

    # Convert all numeric values to native Python types
    analysis_results = {
        "requests_per_ip": sorted_ip_counts,  # Send as a list of tuples
        "most_accessed_endpoint": {
            "endpoint": most_accessed_endpoint,
            "access_count": most_accessed_count
        },
        "suspicious_activity": sorted_suspicious_ips,
        "processing_time": round(timer_end - timer_start, 3),
        "number_of_rows": len(df)
    }

    # Clean up the temporary file
    try:
        os.remove(log_file_path)
    except OSError:
        pass  # Ignore file deletion errors

    return analysis_results


@app.route('/upload_log', methods=['POST'])
def upload_log():
    try:
        # Check if the request contains the file part
        if 'log_file' not in request.files:
            return jsonify({"error": "No log file provided"}), 400

        log_file = request.files['log_file']

        threshold = request.form.get('threshold')

        # Check if the file is empty
        if log_file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Create temp directory if it doesn't exist
        temp_dir = "./temp"
        os.makedirs(temp_dir, exist_ok=True)

        # Save the log file temporarily with a unique name
        log_file_path = os.path.join(temp_dir, f"temp_log_{os.urandom(8).hex()}")
        log_file.save(log_file_path)

        # Process the log file and get the results
        analysis_results = process_log_file(log_file_path, suspicious_threshold=int(threshold))

        return jsonify(analysis_results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/download_report', methods=['POST'])
def download_log():
    try:
        # Check if the request contains the file part
        if 'log_file' not in request.files:
            return jsonify({"error": "No log file provided"}), 400

        log_file = request.files['log_file']

        threshold = request.form.get('threshold')

        # Check if the file is empty
        if log_file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Create temp directory if it doesn't exist
        temp_dir = "./temp"
        os.makedirs(temp_dir, exist_ok=True)

        # Save the log file temporarily with a unique name
        log_file_path = os.path.join(temp_dir, f"temp_log_{os.urandom(8).hex()}")
        log_file.save(log_file_path)

        analysis_results = process_log_file(log_file_path, suspicious_threshold=int(threshold))  # process_log_file should return the structured data

        # Create a DataFrame from the structured results (requests_per_ip, most_accessed_endpoint, suspicious_activity)
        df = pd.DataFrame(analysis_results['requests_per_ip'], columns=['IP Address', 'Request Count'])
        endpoint_df = pd.DataFrame([{
            'Endpoint': analysis_results['most_accessed_endpoint']['endpoint'],
            'Access Count': analysis_results['most_accessed_endpoint']['access_count']
        }])
        suspicious_df = pd.DataFrame(analysis_results['suspicious_activity'], columns=['IP Address', 'Failed Login Count'])

        # Combine all parts into one CSV string
        output = StringIO()
        df.to_csv(output, index=False)
        output.write("\nMost Accessed Endpoint:\n")
        endpoint_df.to_csv(output, index=False)
        output.write("\nSuspicious Activity:\n")
        suspicious_df.to_csv(output, index=False)

        output.seek(0)
        
        # Convert StringIO to BytesIO for sending as a file
        byte_output = BytesIO(output.getvalue().encode())
        byte_output.seek(0)
        
        # Return the CSV as a response
        return send_file(byte_output, mimetype="text/csv", as_attachment=True, download_name="log_analysis_results.csv")

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)