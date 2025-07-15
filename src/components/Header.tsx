
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-5 text-center shadow-lg">
            <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                🇻🇳 So sánh Bản đồ Việt Nam
            </h1>
            <p className="text-xl opacity-90">
                Hover vào bất kỳ tỉnh nào để xem sự thay đổi trước và sau sáp nhập
            </p>
        </div>
    );
};

export default Header;