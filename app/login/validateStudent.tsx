import axios from 'axios';

const DB_SERVICE_URL = `${process.env.NEXT_PUBLIC_DB_SERVICE_URL}/student?student_id=`;

const validateStudent = async (studentId: string): Promise<string | null> => {
    try {
        const response = await axios.get(
            `${DB_SERVICE_URL}${studentId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_DB_SERVICE_BEARER_TOKEN}`,
                },
            }
        );

        if (response.statusText == "OK" && response.data.length !== 0) {
            return null;
        } else {
            return 'Please enter the correct Student ID';
        }
    } catch (error) {
        console.error('Error validating student:', error);
        return 'An error occurred while validating the student.';
    }
};

export default validateStudent;
