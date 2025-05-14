import React, {useState} from 'react';
import Navbar from "./Navbar/Navbar";
import InvoicesTable from "./InvoicesTable/InvoicesTable";
import InvoiceLines from "./InvoiceLines/InvoiceLines";

const Profile = () => {
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
    const [totalAmountArray,setTotalAmountArray] = useState([])
    const NameFromLocalStorage = localStorage.getItem('Name');
    const UserIdFromLocalStorage = localStorage.getItem('UserId');

    return (
        <div>
            <Navbar name={NameFromLocalStorage}/>
            <InvoiceLines selectedInvoiceIds={selectedInvoiceIds} setTotalAmountArray={setTotalAmountArray} />
        </div>
    );
};

export default Profile;