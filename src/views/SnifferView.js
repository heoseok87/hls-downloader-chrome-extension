import * as R from "ramda";
import React from "react";
import { useSelector } from "react-redux";
import RequestRow from "../components/RequestRow";
import Table from "../components/Table";
import { requestsByActiveTabSelector } from "../modules/requests/selectors";
import { Body } from "./Body";
import { useHistory } from "react-router";

function RequestListView() {
  const requests = useSelector(requestsByActiveTabSelector);
  const history = useHistory();

  return (
    <Body>
      <Table
        items={R.reverse(Object.values(requests))}
        emptyMsg="Sorry, i wasn't able to find any HTTP Live Streams"
        renderRow={(requestItem, idx) =>
          console.log(requestItem) || (
            <RequestRow
              tab={requestItem.tab}
              key={requestItem.id || idx}
              request={requestItem}
              onClick={() => history.push(`/request/${requestItem.requestId}`)}
            />
          )
        }
      />
    </Body>
  );
}

export default RequestListView;
