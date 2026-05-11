import sys

def check_encoding(filename):
    try:
        with open(filename, 'rb') as f:
            content = f.read()
        
        # Check for non-UTF-8 characters
        try:
            content.decode('utf-8')
            print("File is valid UTF-8")
        except UnicodeDecodeError as e:
            print(f"UnicodeDecodeError: {e}")
            
        # Check for specifically double-encoded chars
        try:
            text = content.decode('utf-8')
            if 'Ã' in text:
                print("Found suspicious double-encoded character: Ã")
            else:
                print("No Ã found")
        except:
            pass
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_encoding(sys.argv[1])
