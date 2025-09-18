import React, { FC } from 'react';
import './SingleProd.css';
import { Accordion,AccordionItem, AccordionTrigger, AccordionContent } from '../../../ui/accordion'
import {Button} from '../../../ui/button'
import { Switch } from '../../../ui/switch';
import { Label } from '../../../ui/label';

interface SingleProdProps {}

const SingleProd: FC<SingleProdProps> = () => (
  <div className='accordion-container'>
        <Button variant="destructive">Destructive</Button>
 <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
       <div className="SingleProd p-4 max-w-md mx-auto" >
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Product Details</AccordionTrigger>
        <AccordionContent>
          Here are all the details about the product.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipping Info</AccordionTrigger>
        <AccordionContent>
          Shipping takes 3–5 business days.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Return Policy</AccordionTrigger>
        <AccordionContent>
          You can return the product within 30 days.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="outline">Button</Button>
    </div>
  </div></div>
);

export default SingleProd;
