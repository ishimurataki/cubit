"use server";

import { getUserFollowingForSignedInUserServer } from "@/backend-lib/actions";
import Link from "next/link";

export default async function Following() {

    const { areUsersReturned, users, errorMessage } = await getUserFollowingForSignedInUserServer();
    if (!areUsersReturned || users == null || errorMessage) {
        return (
            <div className="bg-gray-200 w-full h-full rounded-lg p-10 flex items-center justify-center">
                An error occurred: {errorMessage}
            </div>
        )
    }

    const tableRows = users.map((user) => {
        return (
            <tr>
                <td className="pr-10 py-1">
                    <Link className="hover:text-cyan-500" href={`user/${user.username}`}>@{user.username}</Link>
                </td>
                <td>{new Date(user.followDate).toDateString()}</td>
            </tr>
        )
    })
    return (
        <div className="border-2 border-black rounded-xl p-4 w-fit mt-4 ml-10">
            <table className="table-auto">
                <tr>
                    <th className="text-left border-b border-slate-300 pr-10">Username</th>
                    <th className="text-left border-b border-slate-300">Follow Date</th>
                </tr>
                {tableRows}
            </table>
            {
                users.length == 0 ? <div className="text-gray-500">No users yet</div> : ""
            }
        </div>

    );
}